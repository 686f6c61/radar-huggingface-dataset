# peasanttide/sam-3d-body-decoder-fp32

## Resumen

Este repositorio contiene únicamente el decodificador (`PromptableDecoder`) del modelo SAM 3D Body de Meta, convertido a precisión float32 para que pueda ejecutarse en el proveedor de ejecución de CPU de ONNX Runtime. El modelo original distribuye sus inicializadores en bfloat16, un formato que el kernel `MatMul` de ORT en CPU no soporta, lo que impide la inferencia sin GPU. La conversión amplía cada valor bfloat16 a float32 de forma exacta (los 16 bits bajos de la mantisa se rellenan con ceros), sin reentrenamiento ni cuantización, manteniendo los pesos bit-idénticos a los originales. El resultado es un único archivo ONNX de 0,2 GB que permite ejecutar el decodificador en entornos sin aceleración por hardware.

El proyecto forma parte del ecosistema de SAM 3D Body, un modelo de Meta para la recuperación de malla corporal completa a partir de una imagen 2D. Este repositorio no incluye el backbone ni el detector, solo el decodificador, por lo que su uso requiere integrarlo con el resto de componentes del pipeline original. La licencia es la SAM License, con restricciones específicas para uso comercial y derivados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PromptableDecoder de SAM 3D Body (no se especifica el tipo exacto de capas) |
| Parametros totales | no disponible (el repositorio pesa 0,2 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (el archivo está en float32, pero no es una cuantización; es una ampliación de precisión desde bfloat16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | SAM License (licencia propia de Meta, no MIT) |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

El modelo es el decodificador de SAM 3D Body, un componente que toma características de la imagen y un prompt (puntos, cajas) para generar una malla 3D del cuerpo humano. La arquitectura interna del decodificador no está documentada en la información proporcionada, pero se sabe que contiene 130 inicializadores bfloat16 que fueron ampliados a float32. La conversión no altera los valores numéricos: cada bfloat16 se expande a float32 rellenando los bits bajos de la mantisa con ceros, lo que es una operación exacta. No hubo reentrenamiento, ni ajuste de pesos, ni cambios en la topología del grafo más allá de la conversión de dtype y la eliminación de nodos `Cast` redundantes. El script `widen_decoder.py` realiza esta transformación de forma reproducible.

El entrenamiento original del modelo SAM 3D Body fue realizado por Meta, pero los detalles sobre el dataset, el número de tokens o el proceso de entrenamiento no se incluyen en este repositorio. Este trabajo es una adaptación técnica para hacer el decodificador utilizable en CPU, no una modificación del modelo en sí.

## Capacidades

- Estimación de pose y recuperación de malla corporal 3D a partir de una imagen 2D (función principal del decodificador).
- Generación de mallas humanas con forma y pose, compatible con el pipeline completo de SAM 3D Body (requiere backbone y detector externos).
- Ejecución en CPU mediante ONNX Runtime, gracias a la conversión a float32, lo que elimina la dependencia de GPU para este componente.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Reconstrucción de personajes 3D para animación: el decodificador convierte una imagen de una persona en una malla corporal que puede usarse en software de modelado 3D (Blender, Maya) para crear avatares o dobles digitales.
- Análisis de posturas en biomecánica: al extraer la pose 3D de una imagen, se pueden estudiar ángulos articulares y movimientos para aplicaciones de fisioterapia o ergonomía.
- Transferencia de poses entre imágenes: el proyecto PeasantTide utiliza este decodificador para leer la pose de una figura en un grabado histórico y aplicarla a un modelo 3D de un campesino, permitiendo recrear escenas con posturas auténticas.
- Integración en pipelines de visión por computador en entornos sin GPU: al ser un archivo ONNX que funciona en CPU, puede desplegarse en servidores económicos o en dispositivos edge para tareas de análisis de imágenes.
- Generación de datos sintéticos para entrenamiento de otros modelos: las mallas generadas pueden usarse como ground truth para tareas de estimación de pose o de profundidad.
- Realidad aumentada y virtual: el decodificador permite capturar la pose de un usuario desde una cámara y proyectarla en un avatar virtual, aunque en este caso se necesitaría el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco hay comparativas cuantitativas de precisión en tareas de recuperación de malla (p. ej., error medio de vértices) en este repositorio.

## Requisitos de hardware

- El archivo ONNX pesa 0,2 GB, por lo que la memoria RAM necesaria para cargar el modelo es inferior a 1 GB (típicamente 0,2 GB para los pesos más overhead del runtime).
- No requiere GPU: la conversión a float32 permite ejecutarlo en el proveedor de CPU de ONNX Runtime.
- Cualquier CPU moderna (x86_64 o ARM) con al menos 2 GB de RAM puede ejecutar la inferencia.
- Opciones de despliegue: ONNX Runtime (C++, Python, Rust a través de `ort`), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado mediciones. Al ser un decodificador pequeño, se espera una latencia de decenas de milisegundos en CPU, pero depende del hardware y del resto del pipeline.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas como SMPL, HMR o VIBE, ya que este repositorio solo contiene el decodificador y no se han publicado resultados de rendimiento. La comparación cualitativa con el decodificador original en bfloat16 es la siguiente:

| Modelo | Precisión | Ejecución en CPU | Licencia |
|---|---|---|---|
| Decodificador original (bfloat16) | bfloat16 | No (ORT CPU no soporta MatMul en bfloat16) | SAM License |
| Este repositorio (float32) | float32 | Sí | SAM License |

Otras alternativas de recuperación de malla (SMPL, HMR) tienen arquitecturas y licencias distintas, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no incluye el backbone ni el detector de SAM 3D Body; solo el decodificador. Para un uso completo es necesario obtener los otros componentes del pipeline original.
- La licencia SAM License restringe el uso comercial y establece prohibiciones específicas (sección 1(b)(v)). No es una licencia MIT, a pesar de que el código del proyecto PeasantTide sea MIT.
- Al ser un modelo de visión, puede presentar sesgos en la estimación de pose según la demografía (género, etnia, complexión) si el entrenamiento original no fue suficientemente diverso. No se han documentado estos sesgos en este repositorio.
- La conversión a float32 aumenta el uso de memoria en comparación con bfloat16, aunque el tamaño sigue siendo manejable (0,2 GB).
- No se garantiza la estabilidad numérica en todos los entornos, aunque la ampliación es exacta y no debería introducir errores adicionales.
- El modelo no es un LLM, por lo que no aplican advertencias sobre alucinación o contexto.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/peasanttide/sam-3d-body-decoder-fp32
- Repositorio oficial de SAM 3D Body (Meta): https://github.com/facebookresearch/sam-3d-body
- Página de investigación de SAM 3D: https://ai.meta.com/research/sam3d/
- Repositorio de conversión completa a ONNX (AmmarkoV): https://huggingface.co/AmmarkoV/SAM3DBody-cpp-onnx-models
- Implementación en C++ (MIT): https://github.com/AmmarkoV/SAM3DBody-cpp
- Script de conversión `widen_decoder.py`: https://github.com/peasanttide/peasanttide/blob/main/tools/widen_decoder.py
- Proyecto PeasantTide: https://github.com/peasanttide/peasanttide
