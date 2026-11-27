# richardyoung/granite-4.2-8b-heretic-GGUF

## Resumen

`richardyoung/granite-4.2-8b-heretic-GGUF` es una distribucion en formato GGUF del modelo `richardyoung/granite-4.2-8b-heretic`, una variante "abliterated" (tambien etiquetada como "uncensored") derivada de la familia IBM Granite 4.2 de 8B parametros. El autor, richardyoung, publica exclusivamente los pesos cuantizados para su uso con llama.cpp y Ollama, no el modelo original en safetensors. El objetivo declarado de este tipo de variantes es eliminar o atenuar los mecanismos de rechazo del modelo alineado, de modo que responda a peticiones que el modelo base declinaria.

La relevancia de esta ficha es doble. Por un lado, documenta una practica cada vez mas comun en el ecosistema abierto: la publicacion de derivados "heretic" o "abliterated" que modifican el comportamiento de seguridad del modelo original sin reentrenarlo desde cero. Por otro, advierte de que se trata de un repositorio con acceso restringido (gated) y de que su uso en produccion exige una evaluacion de riesgos propia, ya que la licencia Apache 2.0 del artefacto no elimina las implicaciones eticas ni legales del comportamiento modificado.

El modelo cuenta con 8.791.592.960 parametros (aproximadamente 8,8B) y un repositorio de 48,7 GB, coherente con la publicacion de multiples niveles de cuantizacion. No se dispone de informacion verificada sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento en la informacion proporcionada, por lo que estos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de IBM Granite 4.2; no se especifica en la informacion proporcionada) |
| Parametros totales | 8.791.592.960 (~8,8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion tipo imatrix (segun tags); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de la familia IBM Granite 4.2, de la que se desconoce en este contexto la configuracion exacta (numero de capas, dimension oculta, tipo de atencion, uso de RoPE, etc.). El tag `base_model:richardyoung/granite-4.2-8b-heretic` indica que este repositorio es una cuantizacion del modelo heretic, no un entrenamiento independiente.

El aspecto tecnico diferencial es el proceso "heretic" o "abliterated", que habitualmente se implementa mediante tecnicas de edicion de direcciones de activacion (abliteration) o ajuste fino selectivo para suprimir la direccion de rechazo aprendida durante el alineamiento. La cuantizacion se ha realizado con el metodo imatrix de llama.cpp, que calibra los pesos cuantizados con estadisticas de activacion para reducir la perdida de calidad respecto a una cuantizacion ingenua. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat (tag `conversational`).
- Respuestas a peticiones que el modelo alineado rechazaria, por la supresion del comportamiento de rechazo.
- Compatibilidad con endpoints compatibles con la API de OpenAI (tag `endpoints_compatible`).
- Ejecucion local mediante llama.cpp y Ollama.
- Capacidades de razonamiento, codigo y matematicas heredadas del modelo base Granite 4.2, si bien no se documentan explicitamente en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar empiricamente que comportamientos cambian al aplicar abliteration sobre un modelo alineado, comparando respuestas con el Granite 4.2 original en un entorno controlado.
- Evaluacion de robustez de filtros: util para probar si los sistemas de moderacion de una aplicacion detectan y bloquean contenido que un modelo sin censura podria generar, sin necesidad de exponer el modelo a usuarios finales.
- Generacion creativa sin restricciones tematicas: escritura de ficcion con tematicas adultas o controvertidas en entornos de investigacion literaria, donde el rechazo del modelo base interfiere con el flujo creativo.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPU de consumo, lo que facilita experimentacion offline y sin dependencia de APIs.
- Analisis de sesgos y contenido danino: generacion controlada de respuestas para auditar sesgos, toxicidad y alucinaciones en modelos sin capa de rechazo, como parte de estudios de evaluacion de riesgos.
- Prototipado de pipelines conversacionales: por su compatibilidad con endpoints tipo OpenAI, puede integrarse en frameworks de agentes para pruebas de integracion antes de sustituirlo por un modelo alineado en produccion.
- Fine-tuning posterior: al ser un punto de partida sin rechazo, sirve como base para ajustes especificos de dominio donde el comportamiento de rechazo del modelo original resulta un obstaculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al no conocerse los niveles de cuantizacion publicados. Como referencia orientativa para un modelo de ~8,8B en GGUF: una cuantizacion Q4_K_M requeriria aproximadamente 5-6 GB de VRAM o RAM; Q8_0 en torno a 9-10 GB; FP16 en torno a 17-18 GB.
- GPU recomendadas: no especificadas en la informacion proporcionada. Para cuantizaciones de 4-5 bits, una RTX 3060 de 12 GB o superior seria suficiente; para Q8_0, una RTX 4090 de 24 GB o una A100/H100 en entornos de servidor.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas (Q4, Q5) en GPUs con 8-12 GB de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (tag explicito), y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`). vLLM y TGI no se mencionan y su soporte para GGUF es limitado o experimental.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/granite-4.2-8b-heretic-GGUF | ~8,8B | no disponible | Apache 2.0 | GGUF | Variante abliterated, acceso restringido |
| IBM Granite 4.2 8B (original) | ~8,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia; comportamiento de rechazo intacto |
| Otras variantes abliterated de 8B (p. ej. Llama 3 8B abliterated) | ~8B | variable | depende del modelo base | GGUF, safetensors | Misma tecnica de supresion de rechazo sobre otras familias |

La comparacion con el Granite 4.2 original es la mas directa: misma base, misma licencia, pero distinto comportamiento de seguridad. Frente a variantes abliterated de otras familias, la diferencia principal es la base Granite, cuyo rendimiento en benchmarks no se documenta aqui.

## Limitaciones y advertencias

- La supresion del rechazo elimina una capa de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtro previo.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la falta de benchmarks publicados que permitan estimar la degradacion respecto al modelo base.
- La cuantizacion GGUF introduce perdida adicional de calidad frente a los pesos originales; el grado exacto depende del nivel de cuantizacion, no documentado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que implica un compromiso de uso por parte del solicitante.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero no exime al desplegador de responsabilidad legal por el contenido generado ni de las obligaciones de moderacion aplicables en su jurisdiccion.
- Idiomas y contexto no documentados: no se recomienda asumir capacidades multilingues ni ventanas de contexto largas sin verificacion empirica.
- No apto para produccion orientada a usuarios finales sin una capa de moderacion externa y una evaluacion de riesgos previa.
- El autor no publica informacion sobre sesgos conocidos ni sobre el proceso exacto de abliteration aplicado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/granite-4.2-8b-heretic-GGUF
- Modelo base (heretic, safetensors): https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Paper de referencia sobre abliteration (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper de referencia adicional (arxiv:2510.18892): https://arxiv.org/abs/2510.18892
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
