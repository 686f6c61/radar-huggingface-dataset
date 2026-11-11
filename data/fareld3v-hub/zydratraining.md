# fareld3v-hub/ZydraTraining

## Resumen

Zydra v2 es un modelo de lenguaje causal de pequeno tamano desarrollado por Farel Alfareza (Theport Studio - Contributors) bajo el paraguas del proyecto Zydra. Se trata de una prueba de concepto entrenada desde cero, partiendo de pesos aleatorios, sobre un subconjunto de un dataset de instrucciones en indonesio. El modelo se distribuye a traves del repositorio `fareld3v-hub/ZydraTraining` en Hugging Face y esta pensado como ejercicio de formacion local mas que como herramienta de produccion.

La model card es explicita al respecto: el autor lo describe como "proof of concept, bukan model serbaguna atau model penalaran yang mumpuni" (prueba de concepto, no un modelo versatil ni un modelo de razonamiento competente). El checkpoint actual solo admite entrada de texto y no soporta analisis de imagenes. El repositorio ocupa 0,4 GB y se publica bajo licencia Apache 2.0.

Por su naturaleza, el interes de esta ficha es documental: describe un experimento reproducible de entrenamiento de un modelo causal pequeno en indonesio, con un pipeline completo de formacion, chat interactivo y exportacion opcional a GGUF. No dispone de datos publicos de arquitectura detallada, numero de parametros ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo de lenguaje causal pequeno; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 y cuantizaciones derivadas (ej. Q4_K_M) mediante llama.cpp |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint canonico) y GGUF (exportacion opcional) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only entrenado desde cero (no es un fine-tune sobre un modelo preexistente, pese a que el campo `base_model` del repositorio apunte a si mismo). El entrenamiento se realiza localmente con PyTorch (rueda de CPU) mediante el script `train.py`, que escanea de forma recursiva todos los ficheros `.txt` y `.jsonl` de la carpeta `datasheet/` para construir el dataset. El pipeline soporta reanudacion desde checkpoint (`--resume`), guardando pesos, estado del optimizador, scheduler y metadatos de epoca, ademas de un modo de prueba rapida (`--max-samples`) y un modo de solo preparacion de datos (`--prepare-data-only`).

Los datos de entrenamiento provienen de un subconjunto de un dataset de instrucciones en indonesio de origen tercero (la model card remite a la carpeta `datasheet/` y a la documentacion de cada fuente para atribucion). No se especifica el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es de caracter practico: un pipeline unico que cubre preparacion de datos, entrenamiento, chat interactivo y exportacion opcional a GGUF con cuantizacion, todo ejecutable en CPU.

## Capacidades

- Generacion de texto autoregresiva en indonesio.
- Conversacion multiturno basica mediante el script `chat.py`, con comandos `keluar` (salir) y `/reset` (borrar historial).
- Modo no interactivo para pruebas rapidas (`chat.py --generate "Halo"`).
- Exportacion a GGUF e inferencia con `llama-cli` de llama.cpp.
- No soporta vision ni analisis de imagenes (explicitamente indicado en la model card).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades multimodales de audio.

## Casos de uso

- Experimentacion educativa en entrenamiento de LLM: el pipeline `train.py` permite reproducir el entrenamiento completo desde cero en local, incluido en CPU, lo que lo hace util para cursos y talleres sobre fundamentos de modelos causales.
- Prueba de concepto de asistentes en indonesio: sirve para validar cadenas de procesamiento (tokenizacion, generacion, decodificacion) en ese idioma antes de invertir en modelos de mayor tamano.
- Base para fine-tuning experimental: al partir de pesos propios y licencia Apache 2.0, puede usarse como punto de partida para experimentos de ajuste con datasets propios en indonesio.
- Validacion de pipelines de exportacion GGUF: el flujo documentado (f16 y Q4_K_M) permite practicar la conversion y cuantizacion de checkpoints propios con llama.cpp.
- Demostraciones de inferencia en CPU: el uso de la rueda de PyTorch para CPU y la posibilidad de ejecutar via llama.cpp lo hacen apto para entornos sin GPU.
- Pruebas de integracion de chat por terminal: el script `chat.py` sirve como banco de pruebas para interfaces conversacionales minimas antes de migrar a frameworks mayores.
- Referencia para auditoria de datasets: la estructura `datasheet/` y el fichero `NOTICE` facilitan estudiar practicas de atribucion de datos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,4 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- GPU recomendadas: no se especifican; el pipeline oficial esta disenado para CPU (PyTorch CPU wheel).
- Compatibilidad con GPU de consumo: muy probable por el tamano del repositorio (0,4 GB), aunque no se documenta oficialmente.
- Opciones de despliegue: scripts propios `train.py` y `chat.py` con PyTorch; inferencia GGUF mediante `llama-cli` de llama.cpp; cuantizacion con `llama-quantize`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zydra v2 | no disponible | no disponible | Indonesio | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El propio autor lo califica como prueba de concepto y advierte que no es un modelo versatil ni competente en razonamiento.
- Entrenado sobre un subconjunto de datos de instrucciones en indonesio; el rendimiento fuera de ese idioma y dominio es incierto.
- Riesgo elevado de alucinacion y respuestas incoherentes por el reducido volumen de entrenamiento y el inicio desde pesos aleatorios.
- No soporta vision ni entrada multimodal.
- No se documentan mecanismos de seguridad, filtrado ni alineacion (RLHF/DPO no mencionados).
- La licencia Apache 2.0 permite uso comercial, pero la model card exige conservar `LICENSE` y `NOTICE` al redistribuir el modelo o derivados.
- Los datos de entrenamiento son de origen tercero; la responsabilidad sobre sus terminos recae en el usuario, que debe consultar `datasheet/` y la documentacion de las fuentes.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay validacion externa de la comunidad.
- No apto para produccion sin evaluacion previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fareld3v-hub/ZydraTraining
- PyTorch: https://pytorch.org
- llama.cpp: https://github.com/ggerganov/llama.cpp
