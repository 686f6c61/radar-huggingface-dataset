# mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF es una cuantizacion estatica en formato GGUF del modelo RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic, publicada por mradermacher. El modelo subyacente es un ajuste fino (post-training) sobre una base Qwen3 de 27 000 millones de parametros, orientado a razonamiento eficiente en tokens (efficient-thinking), uso en terminal (terminal-bench) y eliminacion de comportamiento servil (no-sycophancy). El autor del ajuste lo etiqueta tambien como heretic, uncensored, decensored y abliterated, lo que indica que se han aplicado tecnicas de ablacion de direcciones de rechazo para reducir las negativas del modelo.

La relevancia de esta publicacion es practica: mradermacher ofrece los pesos en multiples niveles de cuantizacion (Q2_K a Q8_0, mas IQ4_XS y F16) para que el modelo pueda ejecutarse en hardware de consumo y en servidores sin GPU de gran memoria. El repositorio ocupa 56,5 GB e incluye un suplemento multimodal mmproj en Q8_0 (0,7 GB), lo que sugiere que el modelo base conserva capacidad de vision heredada de la familia Qwen.

El modelo declara un unico idioma soportado, el ingles, y se distribuye bajo la licencia swift-open-license-1.0, enlazada desde el repositorio del modelo original. No se han publicado resultados de benchmarks en la informacion disponible, ni datos de contexto, arquitectura o composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3, transformer; no confirmado en la informacion) |
| Parametros totales | 26 895 998 464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por la nomenclatura (Qwen3.8-27b) y el tamano de parametros (~26,9 B), se trata presumiblemente de un transformer denso derivado de la familia Qwen3, pero no se confirma en la model card. El modelo es el resultado de un post-training sobre una base Qwen3 de 27 B, con etiquetas que apuntan a un entrenamiento orientado a razonamiento eficiente en tokens y a tareas de terminal (terminal-bench).

El ajuste incluye tecnicas de ablacion (heretic, abliterated, decensored) para eliminar direcciones de rechazo en el espacio de activaciones, y un componente de no-sycophancy que busca reducir la tendencia del modelo a complacer al usuario frente a mantener una postura correcta. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento explicito con modo de pensamiento eficiente en tokens (efficient-thinking), segun las etiquetas del autor.
- Capacidad multimodal probable: el repositorio incluye un suplemento mmproj-Q8_0, lo que indica soporte de vision en el modelo base (no confirmado en la model card).
- Orientacion a tareas de terminal y ejecucion de comandos (terminal-bench).
- Comportamiento no servil (no-sycophancy): menor tendencia a validar premisas incorrectas del usuario.
- Reduccion de rechazos (abliterated/decensored): responde a peticiones que un modelo alineado convencional rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Razonamiento tecnico en ingles: el modelo puede resolver problemas de logica y analisis paso a paso gracias a su modo de pensamiento eficiente, reduciendo el coste por consulta frente a modelos que generan cadenas de razonamiento largas.
- Automatizacion de terminal y DevOps: su entrenamiento en terminal-bench lo hace adecuado para generar y depurar comandos de shell, scripts de despliegue y tareas de administracion de sistemas en entornos controlados.
- Asistencia a investigacion sin filtros excesivos: la ablacion de rechazos permite explorar temas sensibles (seguridad, analisis de contenido, red teaming) sin las negativas sistematicas de modelos alineados de forma estricta.
- Evaluacion de sesgos y robustez: util como contrapunto en estudios que comparan modelos alineados frente a modelos abliterated, midiendo el efecto de la ablacion sobre la calidad y la seguridad de las respuestas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~27 B en GPU consumer con 16-24 GB de VRAM mediante llama.cpp u Ollama.
- Generacion de codigo en pipelines locales: con un contexto no documentado pero presumiblemente amplio (familia Qwen3), puede integrarse en flujos de CI/CD o asistentes de codigo autoalojados donde la privacidad es requisito.
- Prototipado de agentes conversacionales: su naturaleza conversacional y su reducida tendencia a la adulacion lo hacen util en entornos de prueba donde se busca feedback critico en lugar de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - F16: ~54 GB.
  - Q8_0: ~29 GB.
  - Q6_K: ~22 GB.
  - Q5_K_M: ~19 GB.
  - Q4_K_M: ~16-17 GB.
  - IQ4_XS: ~15 GB.
  - Q3_K_M: ~13 GB.
  - Q2_K: ~10 GB.
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) equivalente; GPUs de 16 GB para IQ4_XS con contexto reducido.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con IQ4_XS o Q4_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (endpoints_compatible segun las etiquetas). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-heretic-unsycophantic (este) | ~26,9 B | no disponible | swift-open-license-1.0 | GGUF, safetensors | Ajuste abliterated y no-sycophantic sobre Qwen3 27B |
| Qwen3 27B (base de referencia) | ~27 B | no disponible | segun Qwen | safetensors, GGUF | Modelo original alineado, sin ablacion |
| Modelos abliterated de la comunidad (p. ej. variantes Llama o Qwen) | variable | variable | variable | GGUF | Misma tecnica de ablacion, sin datos comparativos publicados |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el uso en castellano no esta garantizado ni documentado.
- La ablacion de rechazos (abliterated/decensored) elimina barreras de seguridad, lo que aumenta el riesgo de generar contenido danino, ilegal o inseguro. No recomendado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que midan la fiabilidad factual.
- El ajuste no-sycophancy puede producir respuestas mas directas o bruscas, lo que puede afectar la experiencia en atencion al cliente.
- La licencia swift-open-license-1.0 debe revisarse antes de uso comercial; no es una licencia estandar y puede imponer restricciones no evidentes.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion comunitaria.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda Q4_K_M o superior para uso serio.
- El modelo base es un ajuste de la comunidad (RacingAce66) sin paper ni documentacion tecnica detallada; la trazabilidad del entrenamiento es limitada.
- No se confirma soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF
- Modelo base: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
