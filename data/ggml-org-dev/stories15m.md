# ggml-org-dev/stories15M

## Resumen

stories15M es un modelo de lenguaje de juguete (tiny model) publicado por ggml-org-dev en el repositorio `ggml-org-dev/stories15M`, con 24.407.712 parametros reales segun los metadatos de safetensors. No es un modelo destinado a uso productivo: la propia model card lo describe como un modelo diminuto empleado por la suite de tests y el CI de [llama.cpp](https://github.com/ggml-org/llama.cpp), originalmente alojado en `ggml-org/models/tinyllamas/`. Su interes es, por tanto, instrumental: sirve para validar el correcto funcionamiento de la carga de pesos, las cuantizaciones y el pipeline de inferencia de llama.cpp.

El modelo deriva de [karpathy/tinyllamas](https://huggingface.co/karpathy/tinyllamas), concretamente de la variante stories15M, un transformer pequeno entrenado sobre el dataset TinyStories (relatos infantiles sinteticos de vocabulario sencillo). El repositorio distribuye los pesos en formato GGUF con tres cuantizaciones (F32, Q4_0 y Q8_0), variantes big-endian para CI sobre s390x y una version dividida en tres shards (F32 y Q8_0) para probar la carga fragmentada.

Su relevancia actual es la de cualquier artefacto de test: permite a los mantenedores de llama.cpp detectar regresiones en el parseo de GGUF, la conversion de tipos, el manejo de endianness y el split-loading sin depender de modelos grandes ni de descargas costosas. No debe evaluarse como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo tiny de la familia TinyStories; detalles no publicados en la informacion disponible) |
| Parametros totales | 24.407.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q4_0, Q8_0 |
| Idiomas soportados | no disponible (entrenado presumiblemente en ingles por el dataset TinyStories; no confirmado en la informacion disponible) |
| Licencia | no disponible |
| Formato de pesos | GGUF (variantes big-endian y shards F32/Q8_0 incluidas) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que procede de karpathy/tinyllamas, la familia de modelos diminutos entrenados sobre TinyStories, un corpus de relatos cortos sinteticos con vocabulario restringido disenado para estudiar el aprendizaje de lenguaje en regimenes de muy pocos parametros. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo etapas de RLHF o DPO no estan disponibles en la informacion proporcionada.

La innovacion tecnica relevante no esta en el modelo sino en su empaquetado: el repositorio incluye variantes big-endian para validar el CI sobre arquitectura s390x y una division en tres shards (F32 y Q8_0) que ejercita la ruta de carga fragmentada de llama.cpp. Estas variantes convierten al modelo en una herramienta de validacion de formatos, no en un sistema de generacion de texto util.

## Capacidades

- Generacion de texto muy limitada: al estar entrenado sobre TinyStories, su dominio se restringe a relatos infantiles simples de vocabulario reducido.
- Capacidad de razonamiento, codigo y matematicas: no disponible; el modelo no esta disenado ni entrenado para estas tareas.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; no hay evidencia de entrenamiento multilingue.
- Capacidades especiales (thinking mode, vision, audio): ninguna.
- Uso previsto: validacion de la suite de tests y CI de llama.cpp (carga de GGUF, cuantizaciones, endianness, split-loading).

## Casos de uso

- Tests de regresion en llama.cpp: el modelo se ejecuta en la suite de CI para comprobar que la carga de GGUF F32, Q4_0 y Q8_0 sigue funcionando tras cada cambio en el parser o en el motor de inferencia.
- Validacion de endianness en s390x: las variantes `stories15M-be*.gguf` permiten verificar que llama.cpp interpreta correctamente pesos big-endian en arquitecturas no x86.
- Pruebas de split-loading: los shards de `split/` (F32 y Q8_0) ejercitan la ruta de carga fragmentada de llama.cpp con un artefacto de apenas 0,4 GB de repositorio.
- Pruebas de conversion de formatos: sirve como caso de referencia para validar herramientas de conversion a GGUF y de cuantizacion sin incurrir en costes de descarga elevados.
- Entornos de desarrollo con recursos minimos: por su tamano (24,4 M de parametros), puede ejecutarse en CPU en cualquier maquina para pruebas de integracion de pipelines de inferencia.
- Docencia y experimentacion sobre modelos diminutos: util para ilustrar el comportamiento de un modelo entrenado con vocabulario restringido y para comparar cuantizaciones sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F32 (24,4 M de parametros a 4 bytes); aproximadamente 12-15 MB en Q4_0 y 24-26 MB en Q8_0, sin contar overhead del runtime.
- GPU recomendadas: no requiere GPU; esta pensado para ejecucion en CPU dentro del CI.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: llama.cpp (uso previsto), con soporte de GGUF; otras herramientas compatibles con GGUF podrian cargarlo, pero no es su proposito.
- Latencia y throughput estimados: no disponibles; al ser un modelo de test no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ggml-org-dev/stories15M | 24,4 M | no disponible | Test/CI de llama.cpp | no disponible | Hugging Face (GGUF) |
| karpathy/tinyllamas (stories15M) | ~15 M (segun nombre) | no disponible | Modelo diminuto de investigacion sobre TinyStories | no disponible | Hugging Face |
| Modelos tiny de la suite de tests de llama.cpp | variable | no disponible | Validacion de formatos y cuantizaciones | no disponible | Repositorios de ggml-org |

La comparativa es limitada porque la informacion disponible no incluye datos de rendimiento ni de licencia de las alternativas. La diferencia principal entre este repositorio y el original de karpathy es el empaquetado: GGUF con cuantizaciones, variantes big-endian y shards para CI.

## Limitaciones y advertencias

- No es un modelo para uso real: la model card indica explicitamente que no esta pensado para aplicaciones del mundo real.
- Calidad de generacion muy baja fuera del dominio TinyStories; no debe usarse para tareas de produccion.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset TinyStories es sintetico y de dominio restringido.
- Riesgo de alucinacion: alto en cualquier uso fuera de su dominio de entrenamiento, dado el reducido tamano y la naturaleza del corpus.
- Limitaciones de contexto e idioma: no disponibles; no hay evidencia de soporte multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse el repositorio original de karpathy/tinyllamas antes de cualquier reutilizacion.
- Caveat para produccion: su unico uso recomendado es la validacion de herramientas y pipelines de llama.cpp.

## Enlaces

- [Hugging Face: ggml-org-dev/stories15M](https://huggingface.co/ggml-org-dev/stories15M)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
- [karpathy/tinyllamas en Hugging Face](https://huggingface.co/karpathy/tinyllamas)
