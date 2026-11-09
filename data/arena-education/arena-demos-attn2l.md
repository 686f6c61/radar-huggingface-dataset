# arena-education/arena-demos-attn2l

## Resumen

`arena-education/arena-demos-attn2l` no es un modelo de lenguaje, sino un repositorio de autoencoders dispersos (SAE, *Sparse Autoencoders*) publicados para su uso con la librería SAELens. El artefacto entrenado corresponde al hook `blocks.0.attn.hook_z` de un transformer de referencia, es decir, la activación de salida de las cabezas de atención de la primera capa del modelo base sobre el que se entrenó. Los SAE de este tipo se emplean para interpretabilidad mecanicista: descomponer activaciones densas en características dispersas y monitorizables.

El repositorio lo mantiene la cuenta `arena-education`, asociada al programa de formación en interpretabilidad ARENA, y está pensado como material didáctico y de demostración, no como componente de producción. Tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,1 GB y fue creado el 9 de noviembre de 2026. La model card es mínima y no documenta el modelo base, el diccionario, la tasa de dispersión ni el conjunto de entrenamiento del SAE.

Su relevancia es acotada: sirve para reproducir ejercicios de SAELens sobre atención y para inspeccionar cómo se representan patrones en la capa 0 de un transformer. No debe confundirse con un modelo generativo ni usarse como tal, ya que no expone pipeline de inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) sobre activaciones de atención; librería `saelens` |
| Parametros totales | no disponible (el repositorio pesa 0,1 GB; no se detalla el tamaño del diccionario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el SAE opera sobre activaciones puntuales, no sobre secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; carga mediante `SAE.from_pretrained` de SAELens |
| Hook objetivo | `blocks.0.attn.hook_z` |
| Modelo base | no disponible |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un SAE entrenado sobre el hook `blocks.0.attn.hook_z`, que en la convención de TransformerLens corresponde a la salida proyectada de las cabezas de atención antes de la concatenación y proyección de salida. El SAE aprende un diccionario sobredimensionado con activaciones dispersas (típicamente ReLU o TopK, según configuración no documentada) para reconstruir esas activaciones y aislar características interpretables.

No se dispone de información sobre el número de características del diccionario, la función de activación, la tasa de dispersión objetivo, el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de regularización adicionales. La model card solo indica el hook y el identificador de carga, por lo que cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Extracción de características dispersas a partir de activaciones de atención de la capa 0 de un transformer.
- Reconstrucción de activaciones del hook `blocks.0.attn.hook_z` mediante el diccionario aprendido.
- Análisis de interpretabilidad: identificación de direcciones latentes asociadas a patrones de atención.
- Integración con el ecosistema SAELens (`SAE.from_pretrained`, carga de configuración y nivel de dispersión).
- No realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingües propias.
- No dispone de modo *thinking* ni de procesamiento de audio.

## Casos de uso

- Docencia en interpretabilidad: usar el SAE como ejemplo práctico en un curso o taller para mostrar cómo se descompone una activación de atención en características dispersas y cómo se inspeccionan sus activaciones máximas.
- Reproducción de experimentos de ARENA: cargar el SAE con `SAE.from_pretrained` y replicar los ejercicios del programa sobre el hook de atención de la primera capa.
- Análisis de circuitos de atención: estudiar qué características se activan en `blocks.0.attn.hook_z` para un conjunto de prompts y correlacionarlas con patrones sintácticos o posicionales.
- Comparación de SAEs entre capas y hooks: servir como referencia de un SAE de atención frente a SAEs de MLP o de capas posteriores, evaluando diferencias en dispersión y reconstrucción.
- Validación de pipelines de SAELens: comprobar que la instalación, la carga de configuración y la evaluación de dispersión funcionan correctamente antes de entrenar SAEs propios.
- Prototipado de herramientas de monitorización: enganchar el SAE a un transformer para inspeccionar activaciones en tiempo de inferencia y detectar características anómalas en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,1 GB, pero el consumo depende del modelo base sobre el que se aplique el SAE.
- GPU recomendadas: no disponible; para inspección de activaciones basta con una GPU de consumo con memoria suficiente para el modelo base.
- Cabe en GPU de consumo: probablemente sí para el SAE en sí (0,1 GB), pero el modelo base condiciona el requisito real.
- Opciones de despliegue: carga mediante `sae_lens.SAE.from_pretrained`; no está pensado para vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hook / capa | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/arena-demos-attn2l | SAE | `blocks.0.attn.hook_z` | no disponible | no disponible | Hugging Face, 0 descargas |
| SAEs de GPT-2 small (p. ej. `gpt2-small-res-jb`) | SAE | residual stream | GPT-2 small | MIT (según repositorio) | Hugging Face, ampliamente usado |
| SAEs de Gemma Scope | SAE | múltiples capas y hooks | Gemma 2 | Gemma Terms of Use | Hugging Face, uso extendido |
| SAEs de Llama Scope | SAE | múltiples capas y hooks | Llama 3.1 8B | Llama 3.1 Community License | Hugging Face, uso extendido |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse como chatbot o API de completado.
- La model card no documenta el modelo base, el hook exacto en términos de TransformerLens, el tamaño del diccionario ni la métrica de dispersión, lo que dificulta la reproducibilidad.
- Sin licencia declarada, el uso comercial queda en un limbo legal; conviene contactar con el autor antes de integrarlo en un producto.
- El SAE solo es válido para el modelo base y la capa concreta con los que se entrenó; aplicarlo a otro modelo produce resultados sin significado.
- Las características extraídas pueden incluir sesgos presentes en el corpus de entrenamiento, no documentado.
- No hay garantía de mantenimiento ni soporte; el repositorio tiene 0 descargas y 0 likes.
- No se han publicado evaluaciones de fidelidad de reconstrucción ni de interpretabilidad humana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arena-education/arena-demos-attn2l
- Librería SAELens: https://github.com/decoderesearch/SAELens
- Documentación de SAELens: https://decoderesearch.github.io/SAELens/
- TransformerLens (convención de hooks): https://github.com/TransformerLensOrg/TransformerLens
- Programa ARENA (material didáctico de interpretabilidad): https://arena-chapter0-fundamentals.streamlit.app/
