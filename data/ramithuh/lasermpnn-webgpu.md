# ramithuh/lasermpnn-webgpu

## Resumen

LASErMPNN es un modelo de diseño de proteinas condicionado por ligando, desarrollado originalmente por el laboratorio de Polizzi (polizzilab). Esta ficha concreta, `ramithuh/lasermpnn-webgpu`, no es un modelo nuevo sino un export de pesos de inferencia preparado para ejecutarse en el navegador mediante WebGPU, a partir del checkpoint `laser_weights_0p1A_nothing_heldout.pt` de la revision upstream `e70f2c6d`. El autor del export es el usuario de Hugging Face `ramithuh` y el repositorio ocupa aproximadamente 0,1 GB.

El modelo resuelve el problema de generar secuencias de aminoacidos y conformaciones de cadenas laterales para proteinas en presencia de un ligando pequeno, incorporando un codificador de ligando preentrenado en SPICE y afinado especificamente. La relevancia de este export radica en que permite ejecutar inferencia de diseño de proteinas localmente en el navegador, sin depender de GPU en servidor, lo que facilita prototipado, docencia y despliegues con requisitos estrictos de privacidad.

La informacion disponible no detalla la arquitectura interna, el numero de parametros ni la longitud de contexto del modelo original; solo se documentan los formatos de pesos, las precisiones exportadas y las metricas de fidelidad numerica respecto a FP32. Los pesos se distribuyen en tres precisiones (FP32, FP16 e INT8) con manifiestos y checksums SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de diseño de proteinas condicionado por ligando; detalles internos no documentados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion simetrica por fila con escalas F32 adyacentes) |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors (shards de maximo 25.000.000 bytes con manifiesto `manifest.json` por precision) |

Detalle de shards por precision:

| Precision | Shards | Bytes totales |
|---|---:|---:|
| FP32 | 4 | 82.544.532 |
| FP16 | 2 | 41.460.126 |
| INT8 | 1 | 21.119.471 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo (tipo de red, capas, atencion, etc.). Se sabe que el checkpoint incluye un codificador de ligando preentrenado en SPICE y afinado, y que el modelo upstream es LASErMPNN, un disenador de proteinas condicionado por ligando. El checkpoint exportado corresponde a `laser_weights_0p1A_nothing_heldout.pt` de la revision `e70f2c6d765416f7e29d51bfd6d4e08496438878` del repositorio `polizzilab/LASErMPNN`.

En cuanto al export, FP16 redondea las matrices aprendidas a binary16 manteniendo geometria, normas y sesgos en FP32; INT8 aplica cuantizacion simetrica por fila con tensores de escala F32 adyacentes. El manifiesto registra dtypes, formas y checksums SHA256 exactos. No se incluye estado de optimizador ni del dataset de entrenamiento. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de secuencias de aminoacidos para proteinas condicionadas por la presencia de un ligando.
- Prediccion de conformaciones de cadenas laterales (sidechains) junto con la secuencia.
- Codificacion de ligandos mediante un encoder preentrenado en SPICE y afinado.
- Puntuacion mediante log-probabilidades del modelo (log-likelihood), utiles para ranking de diseños.
- Inferencia en navegador mediante WebGPU con el runtime `lasermpnn-webgpu`.
- Soporte de tres precisiones de ejecucion (FP32, FP16, INT8) con manifiestos verificables.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Prototipado de diseno de proteinas en el navegador: un investigador puede cargar el runtime `lasermpnn-webgpu`, apuntar `baseUrl` al directorio de precision deseado y generar diseños condicionados por ligando sin instalar CUDA ni configurar servidores GPU.
- Docencia y demostraciones interactivas: al ejecutarse en WebGPU, permite mostrar en clase como un modelo condicionado por ligando propone secuencias y sidechains, con la ventaja de no requerir infraestructura de servidor.
- Evaluacion rapida de candidatos: usar las log-probabilidades del modelo para clasificar y priorizar diseños generados antes de pasar a validacion experimental o a simulaciones fisicas mas costosas.
- Despliegues con privacidad estricta: al ejecutar la inferencia en el cliente, las estructuras de proteina y ligando no salen del navegador del usuario, lo que resulta adecuado para datos sensibles o bajo acuerdos de confidencialidad.
- Integracion en pipelines de investigacion reproducibles: fijando una revision concreta del repositorio y verificando los checksums SHA256 del manifiesto, se puede garantizar que los pesos usados en un experimento son exactamente los esperados.
- Comparacion de precisiones en entornos reales: el export permite medir en el navegador el impacto de FP16 e INT8 frente a la linea base FP32, usando las metricas de relRMS documentadas como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Lo unico documentado son metricas de fidelidad numerica del export respecto a FP32, medidas en tests de CPU upstream sobre el ejemplo protonado `4jnj-1_prot.pdb` (115 residuos, 31 atomos de ligando):

| Precision | relRMS de logits de aminoacidos condicionales (vs FP32) |
|---|---:|
| FP32 | linea base (validada) |
| FP16 | 6,04605e-4 |
| INT8 | 3,45714e-2 |

Segun el autor, FP16 supera el objetivo de 5e-4 en logits incluso antes de la ejecucion en navegador. Las metricas reproducen las elecciones categoricas de FP32; trayectorias estocasticas no restringidas pueden divergir.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamaño de los pesos es de aproximadamente 82,5 MB en FP32, 41,5 MB en FP16 y 21,1 MB en INT8, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamaño de los pesos, aunque no se documentan requisitos minimos ni navegadores validados.
- Opciones de despliegue: runtime `lasermpnn-webgpu` con `baseUrl` apuntando al directorio de precision del repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo upstream es `polizzilab/LASErMPNN`, del que este repositorio es un export de inferencia para navegador; no se documentan otras alternativas comparables con parametros, contexto o licencia verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ramithuh/lasermpnn-webgpu (este) | no disponible | no disponible | MIT | Hugging Face, pesos safetensors para WebGPU |
| polizzilab/LASErMPNN (upstream) | no disponible | no disponible | MIT | GitHub |
| Otros disenadores de proteinas condicionados por ligando | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las entradas deben contener ya el estado de protonacion del ligando deseado; el bundle no anade hidrogenos ni infiere ordenes de enlace del ligando.
- Las secuencias y cadenas laterales predichas son diseños computacionales; las puntuaciones de log-likelihood son probabilidades del modelo, no energias de union fisicas.
- La precision cuantizada (FP16 e INT8) es experimental; el propio autor recomienda consultar el README del runtime y `metrics.json` para las mediciones completas.
- Las metricas de fidelidad reproducen las elecciones categoricas de FP32; en trayectorias estocasticas no restringidas puede haber divergencia.
- No se documentan sesgos conocidos, riesgos de alucinacion en el sentido de modelos de lenguaje, ni limitaciones de contexto o idioma mas alla del metadato `en`.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia upstream del repositorio `polizzilab/LASErMPNN` y fijar una revision concreta para despliegues reproducibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline definido; conviene validar el export antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/lasermpnn-webgpu
- Repositorio upstream en GitHub: https://github.com/polizzilab/LASErMPNN
- Revision upstream del checkpoint: `e70f2c6d765416f7e29d51bfd6d4e08496438878`
- Directorio de pesos FP32: https://huggingface.co/ramithuh/lasermpnn-webgpu/resolve/<revision>/fp32
- Directorio de pesos FP16: https://huggingface.co/ramithuh/lasermpnn-webgpu/resolve/<revision>/fp16
- Directorio de pesos INT8: https://huggingface.co/ramithuh/lasermpnn-webgpu/resolve/<revision>/int8
- Paper, blog o demo: no disponible en la informacion proporcionada.
