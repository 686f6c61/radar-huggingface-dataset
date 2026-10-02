# edededdy/ShallowSeek-mini-it

## Resumen

ShallowSeek-mini-it es la versión ajustada por instrucciones (chat) del modelo ShallowSeek-mini-base, un Mixture-of-Experts (MoE) extremadamente pequeno del estilo DeepSeek-V3, entrenado desde cero por el desarrollador independiente edededdy (Edmund Martin) sobre la CPU de un portatil. Con aproximadamente 11,0 millones de parametros totales (6,3M activos por token segun la model card, 12.105.360 segun los pesos safetensors), es mas un artefacto educativo y de investigacion que un modelo de produccion.

El modelo parte de un preentrenamiento sobre 286M de tokens de FineWeb-Edu y se afina despues con 16.347 conversaciones (15.530 de entrenamiento y 817 de validacion), combinando pares de pregunta-respuesta fundamentados generados sinteticamente y conversaciones de proposito general de smol-smoltalk. El objetivo del autor es reproducir, a escala minima, los componentes arquitectonicos de DeepSeek-V3: atencion latente multi-cabeza (MLA), enrutamiento MoE con sesgos de equilibrado de carga y un modulo MTP (multi-token prediction).

Su relevancia es fundamentalmente didactica: permite estudiar en un solo fichero pequeno (0,1 GB) como se implementa una arquitectura DeepSeek-style moderna, como se comporta un MoE diminuto en tareas de chat y en que punto exacto falla el razonamiento factual cuando el presupuesto de parametros es ridiculamente bajo. No esta afiliado a DeepSeek y no debe usarse para tareas con consecuencias reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) estilo DeepSeek-V3, transformer con multi-head latent attention (MLA) y modulo MTP |
| Parametros totales | 11,0M (model card) / 12.105.360 (safetensors) |
| Parametros activos | 6,3M por token |
| Longitud de contexto | no disponible (los datos de chat se filtraron para ajustarse a 1.024 tokens; el valor exacto de contexto no se indica) |
| Tipos de cuantizacion | f16 y q8_0 (GGUF); pesos PyTorch en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch, nombres de parametro propios) y GGUF (f16, q8_0) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de DeepSeek-V3 (DeepSeek-AI, 2024): un transformer con capas MoE en las que cada token activa una fraccion de los expertos, atencion latente multi-cabeza (MLA) y un modulo de prediccion multi-token (MTP) incluido en los pesos. El modelo se entreno desde cero, sin partir de ningun checkpoint existente, sobre la CPU de un portatil. El preentrenamiento uso 286M tokens de FineWeb-Edu (ODC-BY 1.0).

El ajuste por instrucciones (SFT) uso 16.347 conversaciones (15.530 de entrenamiento, 817 de validacion), con aproximadamente 1,62M de tokens de asistente entrenados. Alrededor del 36% de esos tokens corresponden a ~10,6K pares de pregunta-respuesta de un solo turno generados por Qwen3.8-9B a partir de documentos de FineWeb-Edu que formaban parte del propio corpus de preentrenamiento (Q&A fundamentado); el ~64% restante son 5.684 conversaciones de smol-smoltalk (conversaciones cotidianas, openhermes, smol-constraints y smol-magpie-ultra-short, capado al 15% de los tokens). La perdida se calcula solo sobre las respuestas del asistente y su token de cierre `<|end|>`, con prompts y padding enmascarados. El entrenamiento fue de 1.942 pasos, batch 16 y 2 epocas con AdamW y tasa de aprendizaje 1,5e-4 → 1,5e-5 con decaimiento coseno. Durante el SFT se congelaron los sesgos de equilibrado de carga del enrutador MoE en sus valores preentrenados. La perdida de validacion bajo de 3,779 a 2,949.

## Capacidades

- Generacion de texto conversacional en formato de chat con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.
- Respuestas fluidas y sobre el tema en conversaciones de un solo turno y multi-turno, con deteccion del momento de parar.
- Q&A de proposito general fundamentado en texto visto durante el preentrenamiento (efecto modesto segun el autor).
- Conversaciones de tipo small talk y multi-turno (heredadas de smol-smoltalk).
- Seguimiento de restricciones simples (dataset smol-constraints).
- Capacidad multilingue limitada al ingles.
- No soporta tool calling ni function calling de forma documentada.
- No hay soporte documentado de agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Docencia y estudio de arquitecturas MoE: permite inspeccionar un MoE real de 11M de parametros con MLA y MTP en 0,1 GB de pesos, ideal para explicar el enrutamiento de expertos y el equilibrado de carga en un aula o tutorial.
- Experimentacion en investigación: sirve como banco de pruebas para comparar tecnicas de SFT, decodificacion o cuantizacion en un modelo que entrena y se ejecuta en CPU, sin necesidad de GPU.
- Generacion de texto sin conexion en hardware minimo: al ejecutarse con llama.cpp u Ollama en CPU, puede desplegarse en dispositivos embebidos o entornos con recursos muy limitados para demos de generacion de texto en ingles.
- Pruebas de pipelines de inferencia: util para validar integraciones con llama.cpp, Ollama o LM Studio y para medir latencias y consumo en escenarios de bajos recursos antes de escalar a modelos mayores.
- Ejemplo educativo de ajuste por instrucciones: los scripts de entrenamiento (repositorio DeepseekStyleMOE) y el formato de chat documentado permiten reproducir un ciclo completo de preentrenamiento + SFT desde cero.
- Evaluacion de alucinacion a escala minima: su tendencia documentada a inventar hechos con seguridad lo convierte en un caso de estudio util para investigar deteccion de alucinaciones y calibracion en modelos diminutos.

## Benchmarks y rendimiento

Datos comparando el modelo base y la version ajustada (IT) sobre los mismos prompts en texto plano, sin plantilla de chat. El azar en MMLU es 25%. El autor advierte que las mejoras en sondas factuales se basan en 14 sondas y 12 pares, por lo que deben interpretarse como un efecto modesto.

| Metrica | Base | IT |
|---|---|---|
| Probes top-5 | 28,6% | 35,7% |
| Log-prob media de respuesta | -5,68 | -5,40 |
| Pares verdadero-vs-falso ganados | 58,3% | 66,7% |
| MMLU (letra) | 24,9% | 25,6% |
| MMLU (cloze) | 25,5% | 25,6% |
| MMLU biologia y medicina (cloze) | 27,8% | 27,7% |

Perdida de validacion en 817 conversaciones reservadas (solo tokens de asistente): 3,779 → 2,949. No se han publicado otros resultados de benchmarks comparativos (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion; los pesos safetensors ocupan una fraccion minima del repositorio de 0,1 GB.
- GPU recomendadas: ninguna en particular; el modelo se entreno y ejecuta en CPU. Cualquier GPU consumer (incluso integradas) es mas que suficiente.
- Cabe sobradamente en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB libres, y tambien en CPU y en dispositivos embebidos.
- Opciones de despliegue: llama.cpp (`llama-cli -m ShallowSeek-mini-it-q8_0.gguf -cnv`), Ollama (`ollama run hf.co/edededdy/ShallowSeek-mini-it-GGUF:Q8_0`), LM Studio y PyTorch mediante `chat.py` del repositorio de entrenamiento. Los GGUF incluyen la plantilla de chat y el repositorio GGUF aporta ficheros `template` y `params` de Ollama.
- Latencia y throughput estimados: no disponible (no se publican cifras de latencia ni de tokens por segundo).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos directamente comparables de la misma categoria (MoE diminutos estilo DeepSeek). La model card no incluye una comparativa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| ShallowSeek-mini-it | 11,0M totales / 6,3M activos | no disponible | apache-2.0 | HuggingFace + GGUF | MMLU ~25,6% (nivel azar) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alucinacion severa: el propio autor advierte que el modelo "inventa hechos con seguridad" y que sus respuestas, aunque fluidas y sobre el tema, son a menudo incorrectas o vagas.
- Escala ridiculamente pequena (11M de parametros): el rendimiento en MMLU esta practicamente al nivel del azar (25%), por lo que no es fiable para conocimiento factual.
- Idioma: solo soporta ingles; no hay garantias de comportamiento correcto en otros idiomas.
- Contexto: la ventana exacta no esta documentada y los datos de chat se recortaron a 1.024 tokens, lo que limita el manejo de entradas largas.
- Uso previsto: artefacto educativo y de investigacion; el autor indica explicitamente que no debe usarse para nada que importe.
- Licencia apache-2.0: permite uso comercial, pero dado el rendimiento del modelo no es recomendable para produccion con consecuencias reales.
- Sesgos: heredados de FineWeb-Edu y smol-smoltalk; no se documenta ningun analisis de sesgos.
- Sin soporte documentado de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edededdy/ShallowSeek-mini-it
- Modelo base: https://huggingface.co/edededdy/ShallowSeek-mini-base
- Repositorio de pesos GGUF del base: https://huggingface.co/edededdy/ShallowSeek-mini-base-GGUF
- Codigo de entrenamiento: https://github.com/EdmundMartin/DeepseekStyleMOE
- Perfil del autor en HuggingFace: https://huggingface.co/edededdy
- Dataset de preentrenamiento: FineWeb-Edu (https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- Dataset de chat: smol-smoltalk (https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk)
- Arquitectura de referencia: DeepSeek-V3 (DeepSeek-AI, 2024)
