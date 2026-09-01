# delta-lab-ai/lean-finder-v2-preview

## Resumen

Lean Finder v2 Preview es un modelo de lenguaje especializado en razonamiento matemático formal y demostración automática de teoremas en el asistente de pruebas Lean. Desarrollado por el laboratorio delta-lab-ai, este modelo está diseñado para asistir a matemáticos y desarrolladores en la formalización de demostraciones, la generación de tácticas y la búsqueda de pruebas en entornos interactivos. El modelo se presenta como una vista previa (preview) de la segunda versión, con una arquitectura basada en el tag `qwen3` que sugiere una base sobre la familia Qwen3, aunque no se confirma oficialmente.

Con 8.188.515.328 parámetros (aproximadamente 8,19 mil millones), el modelo se distribuye en formato safetensors y ocupa 21,5 GB en el repositorio. Su entrenamiento incluye más de 1,4 millones de pares consulta-código, abarcando desde enunciados informalizados hasta estados de prueba aumentados, y se ha alineado mediante DPO (Direct Preference Optimization) con retroalimentación humana y de LLM recopilada de un servicio web desplegado. La relevancia actual radica en la creciente demanda de herramientas que automaticen la verificación formal de matemáticas, un campo con aplicaciones en criptografía, robótica y software crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3 según tag, no confirmado oficialmente) |
| Parametros totales | 8.188.515.328 (8,19 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible. El tag `qwen3` en HuggingFace sugiere que el modelo se basa en la arquitectura Qwen3, que emplea un transformer decoder-only con atencion por ventanas deslizantes y atencion completa alternadas, ademas de un mecanismo de thinking mode opcional. Sin embargo, no hay confirmacion oficial de que sea una adaptacion directa de Qwen3-8B.

El entrenamiento se describe en el repositorio de GitHub: el modelo fue entrenado con mas de 1,4 millones de pares consulta-codigo, que incluyen enunciados informalizados, consultas sinteticas de usuario, estados de prueba aumentados y enunciados formales. Posteriormente se aplico un alineamiento de preferencias mediante DPO, utilizando retroalimentacion humana y de LLM recopilada de un servicio web desplegado. Esta combinacion de datos diversos y alineamiento por preferencias busca que el modelo no solo genere pruebas correctas, sino que tambien se ajuste a las preferencias de los matematicos en cuanto a estilo y estrategia de demostracion.

## Capacidades

- Generacion de tácticas y demostraciones en el lenguaje de Lean, incluyendo la proposicion de pasos de prueba intermedios.
- Razonamiento matematico formal: interpreta enunciados en lenguaje natural y los traduce a proposiciones formales en Lean.
- Busqueda de pruebas: dado un estado de prueba (goal), sugiere secuencias de tácticas para avanzar hacia la demostracion completa.
- Soporte de multiples modalidades de entrada: enunciados informalizados, consultas sinteticas de usuario, estados de prueba aumentados y enunciados formales.
- Alineamiento con preferencias de matematicos mediante DPO, lo que mejora la calidad estilistica de las demostraciones generadas.
- Integracion con entornos de desarrollo interactivo: el modelo se sirve a traves de un servidor (server.py) que permite su uso en herramientas como Lean.

## Casos de uso

- Asistencia en la formalizacion de teoremas: un matematico escribe un enunciado en lenguaje natural y el modelo genera la correspondiente declaracion formal en Lean, reduciendo el tiempo de entrada manual.
- Autocompletado de tácticas en editores de Lean: integrado como plugin, sugiere la siguiente táctica en funcion del estado de prueba actual, acelerando el desarrollo de demostraciones.
- Verificacion de pruebas en proyectos de software critico: equipos que usan Lean para verificar propiedades de sistemas embebidos o protocolos pueden emplear el modelo para explorar rutas de demostracion alternativas.
- Educacion matematica: estudiantes de matematicas formales pueden usarlo para entender que tácticas son aplicables en un contexto dado, recibiendo explicaciones de los pasos sugeridos.
- Generacion de corpus de demostraciones: el modelo puede producir multiples variantes de una misma prueba, util para aumentar conjuntos de datos de entrenamiento o para comparar estrategias.
- Integracion en pipelines de CI/CD para verificación formal: en entornos donde se comprueban teoremas automaticamente, el modelo puede proponer parches de prueba cuando una demostracion falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19 B de parametros, en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (si estuviera disponible) se reduciria a unos 4-5 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas, como NVIDIA A100 (40 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB). Para cuantizacion ligera, una RTX 3060 (12 GB) podria ser suficiente si se aplica cuantizacion externa.
- Si cabe en consumer GPU: si, en GPUs de gama alta con 24 GB o mas. En GPUs de 12 GB solo si se cuantiza a 4 bits o menos.
- Opciones de despliegue: el repositorio incluye un `server.py` que sugiere un despliegue local con API. Tambien podria usarse con vLLM o llama.cpp si se convierte a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no disponibles. Dependera del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de razonamiento formal en Lean. Existen alternativas como DeepSeek-Prover o modelos especificos de Lean, pero no se tienen datos de rendimiento ni caracteristicas comparables en la informacion proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo, por lo que se desconoce si permite uso comercial o modificacion. Se debe contactar con los autores antes de usarlo en produccion.
- No se especifican los idiomas soportados; probablemente este optimizado para ingles y lenguajes de programacion, pero no hay confirmacion.
- El modelo es una vista previa (preview), lo que implica que puede tener errores o comportamientos inestables en comparacion con una version estable.
- No se han publicado benchmarks, por lo que su rendimiento real en tareas de demostracion formal no esta cuantificado.
- Riesgo de alucinacion en tácticas: puede sugerir tácticas que no son validas en el contexto de Lean, especialmente en estados de prueba complejos.
- Dependencia de la calidad de los datos de entrenamiento: aunque se usaron 1,4 M de pares, no se detalla la cobertura de diferentes areas de las matematicas.
- No se indica la longitud de contexto, lo que limita la capacidad de manejar demostraciones muy largas o multiples objetivos simultaneos.

## Enlaces

- HuggingFace: https://huggingface.co/delta-lab-ai/lean-finder-v2-preview
- Repositorio GitHub: https://github.com/delta-lab-ai/lean-finder
- Modelo base en HuggingFace: https://huggingface.co/delta-lab-ai/lean-finder
