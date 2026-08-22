# LayerFault/weights-quantized-metadata-mismatch

## Resumen

Este repositorio es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, identificado como `LF-CH-WGHT-0014`. No es un modelo de inteligencia artificial utilizable, sino un fixture diseñado para ejercitar las reglas de detección de escáneres de seguridad de modelos. Contiene características adversariales deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables o cadenas de inyección de prompts, con el fin de comprobar si una herramienta de análisis las detecta correctamente.

El archivo de pesos en formato safetensors tiene únicamente 128 parámetros, lo que confirma que no contiene un modelo real. La model card advierte explícitamente de que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres. El proyecto Layerfault, disponible en GitHub, es una herramienta de admisión estática y análisis de comportamiento en sandbox para modelos de IA locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de prueba, no es un modelo) |
| Parametros totales | 128 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (contenido adversarial sintético) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio es un artefacto de control del corpus Layerfault, clasificado como "control positivo" con severidad "alta" y dificultad "compuesta". Su propósito es servir como entrada para pruebas de escáneres de seguridad, de modo que estos deben bloquearlo (decisión esperada: `BLOCK`). El contenido del archivo safetensors no corresponde a pesos de red neuronal, sino a datos sintéticos con características maliciosas simuladas.

No hay datos de entrenamiento, tokens, ni técnicas como RLHF o DPO. La unica innovacion tecnica relevante es su uso como caso de prueba para detectar inconsistencias entre metadatos y pesos cuantizados (de ahi el nombre `weights-quantized-metadata-mismatch`).

## Capacidades

- No es un modelo de generacion de texto, codigo, vision ni razonamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es servir como entrada de prueba para herramientas de seguridad estaticas y sandbox de analisis de comportamiento.

## Casos de uso

- **Pruebas de escaneres de seguridad de modelos**: el artefacto permite verificar si una herramienta de admision de modelos (como Layerfault) detecta correctamente un archivo con metadatos inconsistentes y contenido sospechoso.
- **Validacion de reglas de deteccion de opcodes pickle peligrosos**: al contener opcodes adversariales, permite comprobar si el escaner los identifica y bloquea.
- **Deteccion de contrabando de formatos ejecutables**: sirve para probar si el sistema reconoce intentos de ocultar ejecutables dentro de pesos aparentes.
- **Prueba de deteccion de inyeccion de prompts**: contiene cadenas de inyeccion, por lo que puede usarse para evaluar si un escaner las localiza en el contenido de un modelo.
- **Evaluacion de politicas de admision en entornos locales**: como pieza de control positivo, ayuda a confirmar que el sistema de admision bloquea correctamente artefactos con severidad alta.
- **Entrenamiento de detectores de seguridad**: los investigadores pueden usar este y otros artefactos del corpus Layerfault para entrenar o afinar modelos de deteccion de amenazas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo utilizable, no tiene sentido medir su rendimiento en tareas de lenguaje o razonamiento.

## Requisitos de hardware

- No aplica: el artefacto no se ejecuta como modelo de inferencia.
- No requiere VRAM ni GPU.
- Para su analisis estatico basta un entorno de ejecucion de scripts (por ejemplo, Python) en una maquina con recursos minimos.
- Para analisis de comportamiento en sandbox, se necesita un entorno Linux aislado con restricciones de red y sistema de archivos.

## Comparativa con modelos similares

No disponible. Este repositorio no tiene modelos comparables porque no es un modelo de IA; es un artefacto de prueba de seguridad. Los unicos elementos comparables serian otros artefactos del corpus Layerfault, pero no se proporcionan datos al respecto.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no se puede cargar con bibliotecas de inferencia como transformers, vLLM u Ollama.
- **Riesgo de seguridad**: contiene caracteristicas adversariales (opcodes de pickle sospechosos, formatos ejecutables, cadenas de inyeccion de prompts) que pueden activar ejecucion no deseada si se abre fuera de un entorno aislado.
- **Solo para pruebas de seguridad**: no debe usarse en produccion, ni en entornos de desarrollo normales.
- **No hay datos de entrenamiento**: no se puede evaluar su comportamiento linguistico.
- **Licencia**: apache-2.0, pero su uso esta restringido por la advertencia de la model card: solo en entornos aislados de prueba de escaneres.

## Enlaces

- Repositorio HuggingFace: [LayerFault/weights-quantized-metadata-mismatch](https://huggingface.co/LayerFault/weights-quantized-metadata-mismatch)
- Proyecto Layerfault en GitHub: [izm1chael/layerfault](https://github.com/izm1chael/layerfault)
- Documentacion de cuantizacion (contexto general): [GeeksforGeeks - Quantization](https://www.geeksforgeeks.org/deep-learning/quantization-in-deep-learning/)
