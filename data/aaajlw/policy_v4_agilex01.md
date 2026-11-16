# aaajlw/policy_v4_agilex01

## Resumen

`aaajlw/policy_v4_agilex01` es un paquete de checkpoints publicado por el usuario aaajlw (identificado en la model card como "luminbot") para el RoboSynChallenge, una competicion de robotica centrada en tareas de manipulacion con percepcion estereo. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado por el autor: es un bundle de pesos de terceros (SAM2.1 Hiera Large, FoundationStereo y GraspGenX) redistribuidos con bytes identicos para permitir una evaluacion reproducible de un pipeline robotico sobre el robot AgileX.

El repositorio, de 5,9 GB, contiene siete ficheros de pesos y configuracion organizados en tres subdirectorios de servicios (`services/sam2`, `services/foundation_stereo` y `services/graspgenx`), acompanados de un `checkpoint-manifest.json` con hashes SHA-256 y las revisiones de origen. El codigo ejecutable, los servicios y las instrucciones de instalacion no estan en Hugging Face, sino en un repositorio de GitHub externo (rama `20261116-v1`).

La relevancia es acotada: sirve como artefacto de evaluacion para el reto y como ejemplo de empaquetado reproducible de un stack de robotica (segmentacion, profundidad estereo y generacion de agarres) con dependencias externas declaradas, como Ollama y el modelo `qwen3.8:27b-q4_K_M` con proyector de vision. No hay informacion publica sobre entrenamiento propio, benchmarks ni licencia unificada del conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de tres pipelines de vision/robotica: SAM2.1 Hiera Large (segmentacion), FoundationStereo (profundidad estereo) y GraspGenX (generacion de agarres, modulos gen/dis) |
| Parametros totales | no disponible (no se publican recuentos por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato original (`.pt`, `.pth`) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | no disponible; se indica que se aplican las licencias originales de cada componente y no se declara licencia comun de reemplazo |
| Formato de pesos | PyTorch (`.pt` para SAM2.1, `.pth` para FoundationStereo y GraspGenX) mas ficheros YAML de configuracion |
| Tamano del repositorio | 5,9 GB |
| Pipeline declarado | robotics |
| Fecha de creacion / actualizacion | 2026-11-16 / 2026-11-16 |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: agrega tres componentes preentrenados de terceros. SAM2.1 Hiera Large aporta segmentacion de imagenes con un backbone jerarquico Hiera; FoundationStereo implementa estimacion de profundidad estereo a partir de pares de imagenes, con un checkpoint `model_best_bp2.pth` y su `cfg.yaml`; GraspGenX incluye dos submodulos, uno generativo (`gen/epoch_736.pth`) y otro discriminativo (`dis/epoch_1056.pth`), para la generacion y evaluacion de agarres. Los nombres de los ficheros sugieren checkpoints en epocas concretas, pero no se documentan detalles de dataset, numero de tokens, composicion ni procesos de RLHF/DPO, que no aplican a este tipo de modelos.

No hay innovaciones tecnicas atribuibles al autor del repositorio. La model card subraya explicitamente que los siete ficheros conservan sus bytes originales y que se redistribuyen "para evaluacion reproducible, no modelos entrenados por luminbot". El valor tecnico del bundle esta en la trazabilidad: el `checkpoint-manifest.json` lista hashes SHA-256, repositorios de origen y revisiones fijadas. Las dependencias de runtime (Ollama y `qwen3.8:27b-q4_K_M` con proyector de vision) son externas y deben preinstalarse; el URDF y las mallas del robot los proporciona el entorno oficial de evaluacion.

## Capacidades

- Segmentacion de imagenes mediante SAM2.1 Hiera Large, util para aislar objetos en la escena antes de la manipulacion.
- Estimacion de profundidad estereo con FoundationStereo a partir de pares de camaras, necesaria para localizar objetos en 3D.
- Generacion de agarres con GraspGenX, incluyendo un modulo generativo y otro discriminativo para proponer y filtrar candidatos.
- Integracion en un pipeline de robotica de manipulacion sobre la plataforma AgileX, segun el nombre del repositorio y las etiquetas.
- Soporte de diez comandos de tarea documentados en el repositorio de codigo (`docs/runtime-install.md`), aunque la model card aclara que no todas las tareas invocan todos los modelos.
- Dependencia de un modelo de lenguaje externo con vision (`qwen3.8:27b-q4_K_M` via Ollama) para las partes del pipeline que requieran razonamiento o interpretacion de lenguaje.
- No se documentan capacidades de tool calling, agentes multi-paso, matematicas, codigo ni audio propias del bundle.

## Casos de uso

- Evaluacion reproducible en el RoboSynChallenge: el bundle permite a terceros replicar exactamente los pesos usados en la submission `luminbot_models`, gracias a los hashes SHA-256 del manifiesto y a las revisiones fijadas de cada repositorio de origen.
- Segmentacion de objetos en escenas de robotica: SAM2.1 Hiera Large se usaria para generar mascaras de los objetos a manipular antes de planificar el agarre, aislando la region de interes de la imagen.
- Percepcion 3D con camara estereo: FoundationStereo calcularia mapas de disparidad y profundidad a partir de pares de imagenes, aportando la coordenada Z necesaria para que el brazo robotico alcance el objeto.
- Generacion de agarres en produccion: GraspGenX propondria candidatos de agarre y el modulo discriminativo los puntuaria, seleccionando el mas estable para el efector final del AgileX.
- Auditoria de cadena de suministro de modelos: el manifiesto con hashes y revisiones permite verificar que los pesos desplegados coinciden con los originales, un requisito habitual en entornos regulados.
- Base para un pipeline multimodal completo: combinando los tres servicios con el modelo de lenguaje externo `qwen3.8:27b-q4_K_M`, se puede construir un bucle percepcion-lenguaje-accion para instrucciones en lenguaje natural.
- Docencia e investigacion en robotica: el bundle sirve como ejemplo de empaquetado de un stack de percepcion con dependencias externas declaradas y separacion clara entre pesos, codigo y entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 5,9 GB en disco, pero no se desglosa el tamano por componente ni el consumo en memoria.
- GPU recomendadas: no disponible. No se especifican modelos de GPU ni requisitos minimos.
- Compatibilidad con GPU de consumo: no confirmada. SAM2.1 Hiera Large y FoundationStereo son modelos de vision de tamano medio-alto; GraspGenX anade dos redes, por lo que el conjunto podria requerir mas de 8 GB de VRAM, pero no hay dato oficial.
- Opciones de despliegue: los servicios se ejecutan desde el repositorio de GitHub (rama `20261116-v1`, directorio `policy/policy_v4_agilex_v2`); se requiere Ollama con `qwen3.8:27b-q4_K_M` y proyector de vision como dependencia externa preinstalada. No se mencionan vLLM, llama.cpp, TGI ni otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aaajlw/policy_v4_agilex01` | Bundle de checkpoints de robotica (SAM2.1 + FoundationStereo + GraspGenX) | no disponible | no aplica | no disponible (licencias originales por componente) | Hugging Face, 0 descargas, 0 likes |
| SAM 2.1 (Meta) | Segmentacion de imagenes y video | no disponible en la informacion | no aplica | licencia original de Meta (no verificada aqui) | Repositorio oficial de Meta |
| FoundationStereo | Profundidad estereo | no disponible en la informacion | no aplica | licencia original (no verificada aqui) | Repositorio oficial del proyecto |
| GraspGenX | Generacion de agarres | no disponible en la informacion | no aplica | licencia original (no verificada aqui) | Repositorio oficial del proyecto |

No se dispone de datos de rendimiento comparativo entre estos componentes dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una redistribucion de pesos de terceros; cualquier merito tecnico corresponde a SAM2.1, FoundationStereo y GraspGenX.
- La licencia no esta disponible y no se declara una licencia comun de reemplazo; para uso comercial es imprescindible revisar las licencias originales de cada componente en sus repositorios de origen.
- El bundle depende de un modelo de lenguaje externo (`qwen3.8:27b-q4_K_M` con proyector de vision via Ollama) que no se incluye; sin el, el pipeline puede no funcionar segun la tarea.
- El codigo y las instrucciones de instalacion estan fuera de Hugging Face; el repositorio solo contiene pesos y configuraciones, por lo que no es autosuficiente.
- La model card advierte que no todas las tareas invocan todos los modelos; asumir que las diez tareas usan los tres servicios es incorrecto.
- No hay informacion sobre sesgos, tasas de alucinacion ni robustez en dominios distintos al de evaluacion; se desconoce el comportamiento fuera del RoboSynChallenge.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.
- El formato de pesos es PyTorch original (`.pt`, `.pth`), sin versiones GGUF ni cuantizadas; el despliegue en hardware limitado requerira conversion propia.
- Los assets del robot (URDF y mallas) no se incluyen y los proporciona el entorno oficial de evaluacion; sin ellos no se puede reproducir el montaje fisico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aaajlw/policy_v4_agilex01
- Codigo y servicios ejecutables (rama `20261116-v1`): https://github.com/pvlv190/policy_v4_agilex01/tree/20261116-v1/policy/policy_v4_agilex_v2
- Documentacion de instalacion y comandos de tarea: `docs/runtime-install.md` dentro del directorio de politica del repositorio anterior
- Manifiesto de checkpoints con hashes SHA-256 y revisiones: `checkpoint-manifest.json` en el repositorio de Hugging Face
- Repositorios de origen de los componentes: no disponibles como enlaces directos en la informacion proporcionada (se citan en el manifiesto)
