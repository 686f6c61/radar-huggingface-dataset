# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp64

## Resumen

Celerity 271M 8K — TPP ablation — ad0.2_ild_tpp64 es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado originalmente en hardware Cerebras (sistemas CSX) y posteriormente convertido al formato de Hugging Face. El autor del repositorio es `adpretko` y el modelo se publica como parte de un barrido de ablación sobre la tasa de dropout de atención, identificado en el nombre como `ad0.2_ild_tpp64` (attention dropout 0.2, escalado lineal por capa, 64 tokens por parámetro nominal).

El modelo resuelve un problema fundamentalmente experimental: permitir reproducir y comparar variantes de entrenamiento dentro de la familia Celerity, en este caso con una tasa de dropout de atención no nula expresada como punto final de una programación lineal dependiente de la capa. No es un modelo orientado a producción ni a uso general, sino un artefacto de investigación para estudiar el efecto de la regularización de atención en modelos de 271M entrenados con aproximadamente 17 300 millones de tokens sobre CommonPile.

Es relevante ahora porque documenta de forma explícita la procedencia del entrenamiento (pasos, tokens, hiperparámetros, tipo de embedding posicional ALiBi, longitud máxima de secuencia de 8192) y porque emplea una ventana de contexto de 8K con un modelo pequeño, algo poco habitual en esta escala y útil para estudiar eficiencia de contexto y regularización en regímenes de muchos tokens por parámetro. La información pública disponible es escasa: no hay model card extendida, ni benchmarks, ni licencia declarada, ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Celerity), embedding posicional ALiBi |
| Parametros totales | 271M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con código personalizado (`trust_remote_code=True`); repo de 0.5 GB |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de la familia Celerity, con embedding posicional de tipo ALiBi en lugar de posiciones aprendidas o RoPE. El checkpoint se entrenó en 3 sistemas Cerebras CSX con el runtime `cbcore 2.6.0` y se convirtió a formato Hugging Face mediante un conversor con commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. La configuración de entrenamiento incluye 27 837 pasos, un batch global de 76, una tasa de aprendizaje pico de 0.15, weight decay de 0.0024550812491833866 y un `tau_ema` de 0.09754846551842832.

El dato más relevante es la regularización: la tasa de dropout de atención de 0.2 no es uniforme, sino el punto final de una programación lineal dependiente de la capa (`ad0.2_ild_tpp64`), con dropout residual, stochastic depth y LayerDrop todos a 0.0. El modelo se entrenó con 17 331 093 504 tokens (aproximadamente 17,3 mil millones) sobre el dataset CommonPile, en la variante "corrected no-repeat TPP pool", con 64 tokens por parámetro nominal. No se documenta uso de RLHF, DPO ni etapas de alineación posteriores.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje decoder-only de 271M.
- Manejo de contextos de hasta 8192 tokens gracias al embedding ALiBi, que permite extrapolación posicional relativa.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecución de código personalizado del repositorio.

## Casos de uso

- Estudio de ablación de dropout de atención: el modelo sirve como punto de comparación frente a otras variantes de la misma familia para medir el efecto de la programación lineal de dropout por capa en la calidad final y en la estabilidad del entrenamiento.
- Investigación sobre tokens por parámetro: con 64 tokens por parámetro nominal y 17,3 mil millones de tokens vistos, es adecuado para analizar curvas de escalado y saturación en modelos pequeños.
- Experimentos de contexto largo en modelos pequeños: sus 8192 tokens de ventana permiten probar tareas de recuperación de información en contexto (needle-in-a-haystack) o resumen de documentos largos con un coste computacional reducido.
- Reproducibilidad de entrenamiento en Cerebras: la model card detalla pasos, batch, learning rate y weight decay, lo que facilita replicar o auditar el experimento en infraestructura CSX.
- Evaluación de ALiBi frente a otras codificaciones posicionales: al ser un checkpoint con ALiBi y contexto de 8K, sirve para comparar extrapolación posicional con modelos de la misma escala que usan RoPE.
- Docencia y prototipado de bajo coste: al ser un modelo de 271M con repo de 0,5 GB, puede ejecutarse en entornos modestos para demostrar conceptos de entrenamiento, conversión de checkpoints y evaluación.
- Base para fine-tuning experimental: su tamaño reducido permite iterar rápidamente en tareas downstream concretas antes de escalar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 271M parámetros en FP16 se estiman aproximadamente 0,6 GB solo de pesos, y en FP32 alrededor de 1,1 GB, sin contar activaciones ni caché KV.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no se documenta compatibilidad ni cuantizaciones.
- Opciones de despliegue: la carga requiere `trust_remote_code=True` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no se puede confirmar su uso en esos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, se puede contrastar con otras variantes de la propia familia Celerity (mismo tamaño y contexto, distintas tasas de dropout de atención), que son el comparador natural de esta ablación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K TPP ablation ad0.2_ild_tpp64 | 271M | 8192 | no disponible | Hugging Face |
| Otras variantes Celerity 271M 8K (ablaciones TPP) | 271M | 8192 | no disponible | Hugging Face (según repositorio del autor) |
| Alternativas de 271M de otros autores | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de ablación, no un modelo afinado para uso general ni alineado con preferencias humanas.
- Sesgos conocidos: no documentados; al entrenarse sobre CommonPile, puede heredar sesgos del corpus, pero no hay análisis publicado.
- Riesgo de alucinación: alto esperable por su escala (271M) y por la ausencia de etapas de alineación; no hay evaluación específica disponible.
- Limitaciones de idioma: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; hay que contactar con el autor antes de cualquier uso en producción.
- Ejecución de código personalizado: la carga con `trust_remote_code=True` implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- Contexto: aunque soporta 8192 tokens, no hay evaluación de calidad en contextos largos ni de degradación con la distancia.
- Reproducibilidad: el entrenamiento dependió de hardware Cerebras CSX y del runtime `cbcore 2.6.0`, difícil de replicar fuera de esa infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp64
- Repositorio del autor en Hugging Face: https://huggingface.co/adpretko
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
