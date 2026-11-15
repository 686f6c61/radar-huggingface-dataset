# aneeshadas02/lexsi-steering-vectors

## Resumen

LexSI Steering Vectors es un conjunto de artefactos de direccion de activacion (activation steering) extraidos del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario aneeshadas02 en Hugging Face. No se trata de un modelo de lenguaje con pesos propios, sino de vectores de direccion y ficheros de configuracion que permiten modificar el comportamiento del modelo base en tiempo de inferencia, concretamente en el ambito de seguridad multilingue. El repositorio incluye `directions.pt`, `steering_vectors.pt`, `steer_config.json` y `steer_config_sweep.json`, que se aplican sobre las activaciones internas del transformer para inducir o suprimir comportamientos concretos.

La relevancia de este tipo de artefactos radica en que permiten ajustar el comportamiento de un modelo sin reentrenarlo: se actua sobre las representaciones internas durante el forward pass, lo que abarata el control de sesgos, estilos o politicas de seguridad. En este caso, el objetivo declarado por las etiquetas es la seguridad multilingue, aunque la model card no detalla la metodologia de extraccion, el conjunto de datos empleado ni los idiomas cubiertos.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer denso de 1.500 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens y soporte multilingue. El repositorio de steering tiene un tamano de 0,0 GB (sin pesos), cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos de activation steering sobre Qwen2.5-1.5B-Instruct (transformer denso) |
| Parametros totales | No disponible (los artefactos no son pesos de modelo; el base tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para los artefactos; el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (ficheros `.pt` en punto flotante; no se especifica precision) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (`directions.pt`, `steering_vectors.pt`) y JSON (`steer_config.json`, `steer_config_sweep.json`) |

## Arquitectura y entrenamiento

Los artefactos se basan en activation steering, una tecnica que consiste en identificar direcciones en el espacio de activaciones de un transformer que correlacionan con un comportamiento objetivo (por ejemplo, rechazo de peticiones daninas o sesgo de idioma) y sumarlas o restarlas a las activaciones durante la inferencia. El repositorio proporciona dos ficheros de tensores: `directions.pt`, que presumiblemente contiene las direcciones por capa, y `steering_vectors.pt`, con los vectores de intervencion, junto con dos ficheros de configuracion (`steer_config.json` y `steer_config_sweep.json`) que parametrizan la magnitud y las capas de aplicacion.

La model card no especifica como se extrajeron las direcciones (diferencias de medias, contrastive activation addition, PCA supervisado u otro metodo), ni el dataset de contraste utilizado, ni el numero de capas intervenidas, ni los coeficientes de escala. Tampoco se documenta si hubo evaluacion cuantitativa del efecto sobre el modelo base. El unico dato tecnico declarado es la advertencia de que algunas configuraciones de steering incrementan sustancialmente el over-refusal, lo que sugiere que el barrido de configuraciones (`steer_config_sweep.json`) incluye puntos con distinto equilibrio entre seguridad y utilidad.

## Capacidades

- Modificacion del comportamiento del modelo base Qwen2.5-1.5B-Instruct mediante intervencion sobre activaciones internas, sin reentrenamiento.
- Orientacion declarada a seguridad multilingue, segun las etiquetas del repositorio.
- Aplicacion configurable mediante ficheros JSON, con un barrido de configuraciones predefinido.
- Compatible con cualquier capacidad del modelo base (generacion de texto, razonamiento, codigo, tool calling), aunque el steering puede alterar su calidad.
- No incluye capacidades de vision, audio ni thinking mode propias.
- No se documenta soporte especifico de agentes ni de function calling mas alla del que ofrece el modelo base.

## Casos de uso

- Investigacion en interpretabilidad: aplicar los vectores sobre Qwen2.5-1.5B-Instruct para estudiar como se representa la negativa a responder en el espacio de activaciones y validar hipotesis sobre direcciones de seguridad.
- Ajuste de la tasa de rechazo en un asistente desplegado: usar `steer_config_sweep.json` para seleccionar un punto de operacion que reduzca respuestas excesivamente conservadoras en dominios legitimos, midiendo el trade-off con el over-refusal.
- Arnes de evaluacion de robustez multilingue: comparar el comportamiento del modelo base con y sin steering en prompts de distintos idiomas para detectar asimetrias de seguridad.
- Prototipado rapido de politicas de contenido: aplicar los vectores en un pipeline de inferencia local con Qwen2.5-1.5B-Instruct para experimentar con politicas de rechazo antes de invertir en fine-tuning.
- Docencia y formacion: demostrar en un cuaderno reproducible como el activation steering altera el comportamiento de un LLM de 1.5B sin modificar sus pesos.
- Baseline para comparativas de metodos de alineacion: usar estos artefactos como referencia frente a DPO, RLHF o system prompts a la hora de medir coste y eficacia del control de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los artefactos en si ocupan practicamente nada (repositorio de 0,0 GB); el coste real lo determina el modelo base Qwen2.5-1.5B-Instruct.
- Inferencia del base en FP16: aproximadamente 3 GB de VRAM; en cuantizacion de 8 bits, unos 1,6 GB; en 4 bits, alrededor de 1 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB con cuantizacion agresiva.
- GPUs de datacenter compatibles: A100, H100, L40S, aunque son sobredimensionadas para un modelo de 1.5B.
- Despliegue: el steering requiere acceso a las activaciones internas, por lo que hay que implementarlo con PyTorch/Transformers, nnsight o TransformerLens; no es aplicable directamente sobre servidores que no expongan hooks (vLLM estandar, TGI, llama.cpp u Ollama sin modificaciones).
- Latencia y throughput: no disponibles para la configuracion con steering; el base en una RTX 4090 ofrece decenas de tokens por segundo, pero el overhead de los hooks no esta documentado.

## Comparativa con modelos similares

| Artefacto / modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LexSI Steering Vectors | Qwen2.5-1.5B-Instruct | Vectores de activation steering | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | Propio | Modelo instruct denso 1.5B | 32.768 tokens | Apache 2.0 (segun el modelo original) | Ampliamente disponible |
| Vectores de refusal (ej. repE, CAA) | Distintos Llama/Qwen | Activation steering | Depende del base | Variable | Repositorios de investigacion |
| Fine-tuning con DPO sobre Qwen2.5-1.5B | Qwen2.5-1.5B-Instruct | Pesos ajustados | 32.768 tokens | Depende del autor | Variable |

La comparativa directa es limitada porque no existen datos publicados de rendimiento para estos vectores y porque el ecosistema de activation steering carece de estandares de evaluacion comunes.

## Limitaciones y advertencias

- No son pesos de modelo: requieren cargar Qwen2.5-1.5B-Instruct y aplicar los vectores con hooks sobre las activaciones; no funcionan como un checkpoint autonomo.
- La model card advierte explicitamente de que algunas configuraciones de steering incrementan sustancialmente el over-refusal, lo que puede degradar la utilidad en produccion.
- No se documenta la metodologia de extraccion, el dataset de contraste, las capas intervenidas ni los coeficientes recomendados.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial; hay que contactar con el autor o asumir los terminos del modelo base.
- Sin idiomas declarados: la cobertura multilingue es una etiqueta, no una garantia verificada.
- Sin benchmarks ni evaluacion cuantitativa publicada: el efecto real sobre seguridad y utilidad es desconocido.
- Riesgo de alucinacion y sesgos: el steering puede amplificar comportamientos no deseados si se aplica con magnitudes fuera del barrido validado.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso comunitario ni de mantenimiento.
- El steering no sustituye a una alineacion robusta; es una intervencion de inference-time que puede eludirse con prompts adversarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aneeshadas02/lexsi-steering-vectors
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de activation steering en TransformerLens: https://transformerlensorg.github.io/TransformerLens/
- nnsight (hooks de intervencion): https://nnsight.net/
