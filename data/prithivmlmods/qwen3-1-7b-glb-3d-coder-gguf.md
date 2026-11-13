# prithivMLmods/Qwen3-1.7B-GLB-3D-Coder-GGUF

## Resumen

Qwen3-1.7B-GLB-3D-Coder-GGUF es la distribucion en formato GGUF del modelo ccore/Qwen3-1.7B-GLB-3D-Coder, un ajuste fino independiente de Qwen3-1.7B realizado por CCORE. No se trata de un lanzamiento oficial de Qwen. El modelo esta especializado en generar paginas HTML autonomas que renderizan un asset 3D de baja poligonizacion mediante Three.js, con una vista previa interactiva y un boton de exportacion a GLB, orientado a la produccion de assets para el editor Godot.

El repositorio, publicado por prithivMLmods, empaqueta el checkpoint base en multiples cuantizaciones GGUF para su uso con llama.cpp y entornos compatibles con endpoints, ademas de pesos FP16 en safetensors para Transformers. Con 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y atencion de consulta agrupada (GQA) en las 28 capas heredadas de Qwen3-1.7B, el modelo esta pensado para iterar en hardware modesto: la version Q8_0 ocupa 1,83 GB y la F16/BF16, 3,45 GB.

Su relevancia es acotada pero concreta: cubre una tarea de nicho (generacion de codigo Three.js para assets 3D exportables a GLB) con una licencia permisiva Apache 2.0 y un coste de inferencia muy bajo. Es un lanzamiento en fase temprana, sin cifras de benchmarks publicadas y con fallos de renderizado o exportacion que, segun el autor, requieren reintentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con atencion de consulta agrupada (GQA) en las 28 capas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors FP16 (Transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parametros que conserva atencion de consulta agrupada en sus 28 capas. Sobre esa base, CCORE realizo un ajuste fino supervisado empleando el dataset ccore/ThreeJS-3D-GLB-Assets, que cubre 40 dominios de assets: personajes, criaturas, jefes, props, vehiculos, arquitectura y objetos interactivos. El objetivo del entrenamiento es que el modelo emita paginas HTML completas y autonomas que carguen Three.js, monten una escena con el asset de baja poligonizacion, ofrezcan una vista previa interactiva y permitan exportar el resultado a GLB, incluyendo animacion cuando el asset la requiera, con destino al editor Godot.

La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco describe innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos. El autor indica que el objetivo era un ciclo de iteracion corto en hardware modesto, y que las pruebas principales se hicieron en F16 y Q8_0, advirtiendo que Q4_K_M produce una calidad de salida sustancialmente inferior.

## Capacidades

- Generacion de codigo: produce paginas HTML autonomas con JavaScript y Three.js para renderizar escenas 3D.
- Generacion de assets 3D de baja poligonizacion descritos en lenguaje natural (personajes, criaturas, props, vehiculos, arquitectura, objetos interactivos).
- Exportacion a GLB: incluye un boton de exportacion en el HTML generado y animacion en el GLB cuando el asset la necesita.
- Vista previa 3D interactiva integrada en la pagina generada.
- Cobertura de 40 dominios de assets segun el dataset de entrenamiento.
- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de assets para Godot: el desarrollador describe un objeto (por ejemplo, "un mostrador de panaderia con vitrina de cristal, hogazas y cestas de mimbre") y el modelo genera una pagina HTML con la escena Three.js y el GLB exportable, que se importa directamente en el editor.
- Generacion de props y decorados de baja poligonizacion: util para equipos pequenos que necesitan llenar escenas con objetos secundarios sin modelador dedicado, apoyandose en los 40 dominios cubiertos por el dataset.
- Iteracion en hardware modesto: con la cuantizacion Q8_0 (1,83 GB) o Q4_K_M (1,11 GB), el modelo se ejecuta en CPU o en GPUs de gama baja, lo que permite un bucle de prueba y error local sin coste de API.
- Creacion de personajes y criaturas con animacion: el modelo exporta GLB con animacion cuando el asset la requiere, lo que sirve para enemigos, jefes o NPCs de prototipo.
- Generacion de demos web de assets 3D: la pagina HTML resultante es autonoma y puede publicarse como preview interactivo de un catalogo de assets para revisores o clientes.
- Automatizacion de pipelines de assets en lote: al ser un modelo pequeno y con licencia Apache 2.0, puede integrarse en scripts que generen variantes de un mismo tipo de objeto para poblar niveles.
- Educacion y aprendizaje de Three.js: las paginas generadas sirven como ejemplos funcionales de escenas Three.js con carga de GLB y controles interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un lanzamiento en fase temprana y que no proporciona cifras de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en Q4_K_M, 1,8 GB en Q8_0 y 3,45 GB en F16/BF16, mas el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para Q8_0 o F16; el modelo cabe en RTX 3060, RTX 4060, RTX 4090 y equivalentes. Para Q4_K_M basta con 2 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente toda la gama actual, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, text-generation-inference (el repo incluye el tag), endpoints compatibles y Transformers con los pesos FP16 en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: temperatura 0,8, top-k 40, top-p 0,95, repeat penalty 1,0 y un system prompt fijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-1.7B-GLB-3D-Coder | 1,72 B | No disponible | Codigo Three.js y assets GLB para Godot | Apache 2.0 | GGUF, safetensors |
| Qwen3-1.7B (base) | 1,72 B | No disponible | Proposito general, texto y codigo | Apache 2.0 | safetensors, GGUF |
| ccore/Qwen3-1.7B-GLB-3D-Coder | 1,72 B | No disponible | Mismo ajuste fino, pesos originales | Apache 2.0 | safetensors |

La comparativa se limita a la familia Qwen3-1.7B porque la informacion proporcionada no incluye datos de rendimiento frente a otros modelos de codigo o de generacion 3D. No hay cifras de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo en fase temprana: el autor advierte que algunas generaciones fallan al renderizar o exportar y requieren reintentos.
- Calidad degradada en Q4_K_M: la model card senala explicitamente que esta cuantizacion produce salidas de calidad sustancialmente inferior; se recomienda Q8_0 o F16 como punto de partida.
- Solo ingles: el unico idioma declarado es en, por lo que las instrucciones en castellano pueden degradar la calidad de la salida.
- Contexto no documentado: no se especifica la longitud de contexto, lo que dificulta planificar conversaciones multi-turno o prompts largos.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval ni metricas equivalentes, ni evaluaciones de la calidad de los assets generados.
- Riesgo de alucinacion: al ser un modelo pequeno especializado, puede producir APIs de Three.js inexistentes o geometrias incoherentes; la salida debe validarse ejecutando la pagina.
- Alcance restringido: fuera de la generacion de escenas Three.js y exportacion GLB, su utilidad como modelo generalista o de codigo es limitada frente a Qwen3-1.7B sin ajustar.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantias sobre la originalidad de los assets generados ni sobre posibles similitudes con el dataset de entrenamiento.
- Dependencia de un system prompt fijo: el autor recomienda usarlo, lo que reduce la flexibilidad de integracion en pipelines propios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3-1.7B-GLB-3D-Coder-GGUF
- Modelo base (ajuste fino original): https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
