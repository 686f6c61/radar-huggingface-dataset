# garagarara/GLM-5.3-Flash-Uncensored-3.05bpw-h6-exl3

## Resumen

GLM-5.3-Flash-Uncensored-3.05bpw-h6-exl3 es una cuantizacion EXL3 del modelo orcarouter/GLM-5.3-Flash-Uncensored-FP8, subida por el usuario garagarara. Se trata de una build "abliterated" (con la direccion de rechazo eliminada de los pesos) del GLM-5.3-Flash de Z.ai, un modelo de mezcla de expertos de 320.000 millones de parametros totales y 18.000 millones activos, con torre nativa de vision y video, contexto de 1 millon de tokens y cabeza especulativa MTP. La cuantizacion se ha realizado con exllamav3 apuntando a 3,0 bits por peso con la opcion -hq, lo que da como resultado 3,05 bpw y un peso de 117,529 GiB.

El modelo resuelve el problema de ejecutar localmente un MoE de gran tamano con contexto muy largo: frente a la version block-FP8 del modelo base (que exige hardware Hopper con soporte nativo de FP8), esta version comprime los pesos a ~3 bits para que quepan en configuraciones multi-GPU mas asequibles, manteniendo la misma arquitectura, el mismo tokenizador y el mismo diseno de atencion hibrida. La relevancia actual viene doble: por un lado, la familia GLM-5.3-Flash se publico bajo licencia MIT el 29 de agosto de 2026 tras el preestreno sigiloso "Ox Alpha"; por otro, la variante sin censura esta pensada exclusivamente para investigacion de seguridad, interpretabilidad y red-teaming.

Es importante senalar que este repositorio no es un modelo nuevo ni un fine-tune: es una conversion de precision del checkpoint sin censura de OrcaRouter. El autor declara 0 descargas y 0 likes en el momento de la consulta, y los metadatos de safetensors del repo indican 63.009.589.342 parametros, una cifra que no cuadra con los 320B que declara la model card del modelo base; el tamano del repo (126,2 GB a 3,05 bpw) si es coherente con un modelo de ~320B, por lo que se recomienda verificar la cifra antes de planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (glm5_next): transformer MoE hibrido con atencion gated-linear KDA y atencion full dispersa, MLA, mHC y torre vision+video |
| Parametros totales | 320B segun la model card del modelo base; 63.009.589.342 segun los metadatos safetensors de este repositorio (dato discrepante, el tamano del repo a 3,05 bpw es coherente con ~320B) |
| Parametros activos | 18B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | EXL3 a 3,05 bpw (objetivo 3,0 bpw con opcion -hq, cabecera h6). En la familia existen variantes de 2,51 bpw (98,123 GiB) y 4,05 bpw (153,810 GiB). El modelo base esta en block-FP8 y hay builds de terceros en GGUF y NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3); tamano del repo 126,2 GB; peso declarado de la variante 117,529 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es `glm5_next`, con 45 capas transformer mas un bloque MTP (multi-token prediction) usado como cabeza especulativa. La capa de atencion es hibrida: 34 capas de atencion lineal con compuerta (KDA) y 11 capas de atencion full dispersa con un indexador top-2048 aplicado cada 4 intervalos. Emplea MLA (multi-head latent attention) con q-LoRA de 1536 y kv-LoRA de 512 en configuracion NoPE, sobre una dimension oculta de 4096. El componente MoE consta de 288 expertos enrutados con top-8 mas 1 experto compartido, dejando las 3 primeras capas densas. Incorpora ademas conexiones residuales de tipo Manifold-Constrained Hyper-Connections (mHC) de 4 vias y una torre nativa de vision y video.

Sobre el entrenamiento no hay datos en la informacion disponible: no se especifican el numero de tokens, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros) del GLM-5.3-Flash original. Lo que si se documenta es la intervencion posterior: la build sin censura de OrcaRouter aplica abliteracion ortogonalizando la direccion de rechazo fuera del flujo residual y horneando el resultado directamente en los shards oficiales en block-FP8, conservando nombre, dtype y forma de cada tensor, con lo que resulta un reemplazo directo (drop-in) de `zai-org/GLM-5.3-Flash` en cualquier stack que ya lo sirva. La intervencion de garagarara es una cuantizacion EXL3 de ese checkpoint, con la innovacion tecnica propia del formato: cuantizacion por bloques con cabecera de mas bits (h6) y opcion de alta calidad (-hq).

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte declarado de razonamiento multi-paso.
- Razonamiento y cadena de pensamiento; la model card original etiqueta el modelo como modelo de razonamiento.
- Codigo y matematicas: presente en el uso previsto segun las descripciones de terceros (chat, escritura creativa, coding, trabajo agentico).
- Tool calling y function calling: etiquetado explicitamente como `function-calling`.
- Vision e imagen-a-texto: torre nativa de vision y video, con la etiqueta `image-text-to-text` y `vision-language`. En builds de terceros el soporte de vision se describe como dependiente del proveedor de servicio.
- Contexto largo: ventana de 1M tokens, adecuada para documentos extensos, repositorios completos o transcripciones largas.
- Decodificacion especulativa nativa mediante la cabeza MTP integrada.
- Modo sin censura: responde a peticiones que el modelo alineado rechazaria, sin guardarrailes efectivos incorporados.
- Capacidades multilingues limitadas a en y zh segun los metadatos del repositorio.

## Casos de uso

- Investigacion de mecanismos de rechazo: el modelo permite estudiar que representaciones internas activan o desactivan el comportamiento de negativa, comparando activaciones contra el GLM-5.3-Flash alineado en las mismas entradas.
- Red-teaming y evaluacion de robustez (AI red team): sirve como generador adversarial para producir prompts e intentos de evasion con los que probar sistemas de moderacion propios, dado que no aplica rechazo previo.
- Analisis de documentos muy largos: con 1M tokens de contexto se pueden cargar contratos completos, expedientes o bases de codigo enteras en una sola pasada sin trocear, y hacer preguntas transversales sobre el conjunto.
- Revision y generacion de codigo en pipelines internos: soporta function calling, por lo que puede integrarse en flujos de CI/CD que invoquen herramientas (linters, ejecucion de tests, consultas a repositorios) y devuelvan hallazgos estructurados.
- Asistentes agenticos multi-paso: la combinacion de tool calling, razonamiento y contexto largo permite loops de planificacion, llamada a herramientas y verificacion sobre tareas de varias horas.
- Procesamiento de video y vision para analisis forense: la torre de vision y video permite describir, indexar o resumir material audiovisual en lotes, por ejemplo para catalogacion de archivo.
- Generacion de datos sinteticos para entrenamiento: al no rechazar peticiones, se puede usar para producir datasets de casos limite, incluyendo ejemplos negativos y de contenido sensible, siempre en un entorno controlado.
- Escritura creativa sin filtros y exploracion de estilos: util en investigacion sobre sesgos y en generacion de ficcion con tematicas que los modelos alineados suelen evitar.

Advertencia: estos casos de uso deben ejecutarse en entornos de investigacion controlados. El propio autor prohibe el despliegue a usuarios finales sin capas propias de seguridad y moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de este repositorio ni los resultados de busqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, MMLU-Pro, Vision o cualquier otra evaluacion estandar para el modelo base, para la build sin censura ni para esta cuantizacion. Tampoco se aportan mediciones de degradacion por la cuantizacion a 3,05 bpw frente al checkpoint block-FP8 original.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante de 3,05 bpw ocupa 117,529 GiB de pesos. A eso hay que sumar la cache KV, que con contexto de 1M tokens y MLA puede crecer de forma considerable; el consumo real dependera del lote, la longitud de contexto configurada y el backend.
- La variante de 2,51 bpw ocupa 98,123 GiB y la de 4,05 bpw, 153,810 GiB. Son las alternativas naturales si el presupuesto de VRAM es ajustado o si se busca mayor fidelidad numerica.
- GPU recomendadas: para 117,5 GiB hacen falta al menos 2 GPU de 80 GB (H100, H200, A100 80 GB) o una configuracion de 3-4 GPU de 48 GB (L40S, A6000 Ada). El bloque MTP anade requisitos de memoria propia, aunque modesta.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar los pesos, ni siquiera la variante de 2,51 bpw. Seria necesario repartir en varias GPU y aun asi excede lo razonable en un equipo de consumo.
- Opciones de despliegue: el formato EXL3 es especifico de exllamav3 y de los servidores compatibles (TabbyAPI y similares). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible; para esos backends habria que recurrir a las builds GGUF o FP8 de la misma familia.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | formato / precision | Licencia | Notas |
|---|---|---|---|---|---|
| garagarara/GLM-5.3-Flash-Uncensored-3.05bpw-h6-exl3 (este) | 320B totales / 18B activos segun model card | 1M tokens | EXL3 3,05 bpw, 117,529 GiB | MIT | Cuantizacion para exllamav3 del checkpoint sin censura de OrcaRouter |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | 320B / 18B | 1M tokens | block-FP8 | MIT | Modelo base de esta cuantizacion; los pesos de rechazo estan horneados en los shards oficiales y es reemplazo directo del modelo de Z.ai |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | 320B / 18B | 1M tokens | FP8 | no disponible en la informacion recogida | Build sin censura alternativa (marca CRACK), con eliminacion del rechazo directamente en los pesos; declara velocidad nativa en GPUs Hopper (H100/H200) |
| zai-org/GLM-5.3-Flash | 320B / 18B | 1M tokens | block-FP8 | MIT | Modelo original alineado de Z.ai, con guardarrailes de rechazo intactos; misma arquitectura y mismo layout de shards |

Como alternativas de menor tamano dentro de la misma familia existen las cuantizaciones EXL3 de 2,51 bpw (98,123 GiB) y 4,05 bpw (153,810 GiB), que cubren el mismo caso de uso con distinto compromiso entre tamano y fidelidad.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: la abliteracion elimina la direccion de rechazo del flujo residual, por lo que el modelo cumple peticiones daninas, poco eticas, ofensivas o ilegales que el original rechazaria. No tiene guardarrailes internos significativos.
- Solo para investigacion legitima: interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez y experimentos controlados. No debe desplegarse a usuarios finales sin capas propias de moderacion y prevencion de abuso.
- Responsabilidad legal del usuario: quien descarga y usa el modelo asume toda la responsabilidad y liability sobre su uso y sobre las salidas generadas.
- Alto riesgo de alucinacion: no hay datos de evaluacion de fidelidad en la informacion disponible, y un modelo de 320B con 18B activos y contexto de 1M tiende a producir contenido plausible en contextos largos; conviene verificar cualquier salida factual.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible. Dado que la intervencion de abliteracion actua sobre una unica direccion de rechazo, es previsible que persistan sesgos de genero, raza, religion o nacionalidad del modelo base, pero no hay mediciones publicadas.
- Limitacion idiomatica: los idiomas declarados son en y zh unicamente. El rendimiento en castellano u otras lenguas no esta garantizado ni evaluado.
- Limitacion de formato: los pesos estan en EXL3 y requieren exllamav3 o un servidor compatible. No hay rutas de despliegue documentadas para llama.cpp, Ollama, vLLM o TGI en este repositorio.
- Discrepancia en parametros totales: los metadatos safetensors indican 63.009.589.342 parametros mientras que la model card declara 320B totales. Conviene verificar la cifra antes de dimensionar hardware, aunque el tamano del repo (126,2 GB a 3,05 bpw) apunta a ~320B.
- Degradacion por cuantizacion: no se publican comparativas de calidad entre los 3,05 bpw y el checkpoint FP8 original, por lo que la perdida de precision es desconocida.
- Riesgo de cadena de custodia: se trata de una cuantizacion de una build sin censura de terceros, a su vez derivada del modelo de Z.ai; los autores originales no respaldan ni asumen responsabilidad sobre esta version.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/garagarara/GLM-5.3-Flash-Uncensored-3.05bpw-h6-exl3
- Modelo base de la cuantizacion: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante EXL3 de 2,51 bpw: https://huggingface.co/MikeRoz/GLM-5.3-Flash-Uncensored-2.51bpw-h6-exl3
- Variante EXL3 de 3,05 bpw (misma referencia de tamano): https://huggingface.co/MikeRoz/GLM-5.3-Flash-Uncensored-3.05bpw-h6-exl3
- Variante EXL3 de 4,05 bpw: https://huggingface.co/MikeRoz/GLM-5.3-Flash-Uncensored-4.05bpw-h6-exl3
- Build sin censura alternativa (dealignai, FP8): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8/blob/main/README.md
- exllamav3 (libreria de inferencia): https://github.com/turboderp-org/exllamav3
- OrcaRouter: https://www.orcarouter.ai
- Catalogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Organizacion GitHub Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Orca Code Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- Discord de OrcaRouter: https://discord.gg/yAh6Tex6kx
- Cuenta de X de OrcaRouter: https://x.com/OrcaRouter
- Analisis de la build sin censura de OrcaRouter: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha de la version abliterada: https://www.abliteratedmodels.org/glm-5.3-flash-uncensored/
- Ficha en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
- Licencia MIT: https://opensource.org/license/mit
