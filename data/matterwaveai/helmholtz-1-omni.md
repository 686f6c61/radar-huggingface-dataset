# MatterWaveAI/helmholtz-1-omni

## Resumen

HELMHOLTZ-1-Omni es un modelo multimodal de tipo *any-to-any* desarrollado por MatterWaveAI, construido sobre el modelo base HELMHOLTZ-1. Se presenta como una implementación de la arquitectura *Joint-Embedding Predictive Architecture* (JEPA) con representación platónica, unificando texto, visión, audio, síntesis de voz a 16 kHz y rejillas espaciales 2D en un único espacio latente ortogonal compartido. Su rasgo más distintivo es que no emplea matrices densas `nn.Linear` ni capas convolucionales (`nn.Conv1d`/`nn.Conv2d`): toda la geometría se implementa mediante cascadas de rotaciones de Givens en `SO(D)`.

El modelo almacena aproximadamente 54,4 millones de parámetros, con una capacidad equivalente densa estimada de unos 135 millones. El núcleo lingüístico es un transformer rotacional de 12 capas con `d_model=256` y longitud máxima de secuencia de 2.048 tokens. Sobre él se montan torres específicas de visión (14x14 parches polares), audio (STFT polar) y una cabeza vocoder para síntesis de voz, todas conectadas mediante *stitchers* ortogonales que alinean cada modalidad con el manifold latente común.

La relevancia del modelo es fundamentalmente conceptual: sirve como verificación empírica de la *Platonic Representation Hypothesis* formulada por Balestriero y LeCun en el artículo referenciado (arXiv:2610.39302), demostrando que distintas modalidades sensoriales convergen a la misma representación latente salvo una rotación ortogonal. Está publicado con licencia Apache 2.0 y es compatible con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-JEPA con transformer rotacional (Givens) y torres multimodales ortogonales; 0 `nn.Linear`, 0 `nn.Conv*` |
| Parametros totales | ~54,4 M almacenados (~135 M equivalentes densos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (núcleo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Desglose de parámetros por componente:

| Componente | Modulo | Parametros |
|---|---|---|
| Núcleo de lenguaje y world model | `GRTModel` + `GRT-JEPA` | 29.305.498 |
| Torre de visión | `GRTVisionModel` | 4.954.258 |
| Torre de audio | `GRTAudioModel` | 3.288.972 |
| Cabeza vocoder de voz | `GRTPolarVocoderHead` | 47.361 |
| Stitchers `SO(D)` y predictor JEPA | `HelmholtzOmniPlatonicJEPA` | ~16.800.000 |

## Arquitectura y entrenamiento

El modelo se articula en torno a un transformer rotacional de 12 capas con `d_model=256`, donde las transformaciones lineales convencionales se sustituyen por cascadas de rotaciones de Givens que pertenecen al grupo especial ortogonal `SO(D)`. Esta restricción geométrica garantiza que cada proyección tenga determinante +1 y preserve la estructura métrica del espacio latente. Las torres de visión y audio emplean *stems* polares (parches 14x14 con RoPE 2D en visión; STFT polar con RoPE 1D en audio) seguidas de bloques rotacionales bidireccionales que producen 64 tokens por modalidad. La síntesis de voz se realiza mediante una cascada *butterfly* de Givens de 15 etapas seguida de `torch.istft` a 16 kHz.

El entrenamiento se basa en los principios de la *Platonic Representation Hypothesis*: cada modalidad y cada vista de razonamiento socrático (`GLOSS`, `SEE`, `SAY`, `DO`, `KNOW`) se alinea con el manifold latente común mediante *stitchers* ortogonales específicos `Q_m ∈ SO(D)`, sin necesidad de retropropagación sobre pares emparejados. La model card reporta una deriva de factorización de Givens del orden de 1e-14, lo que indica una ortogonalidad numéricamente exacta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación y modelado de texto mediante el núcleo `HELMHOLTZ-1` con contexto de 2.048 tokens.
- Percepción visual: descripción de imágenes y *grounding* espacial y cromático (precisión reportada del 95,8 % en color y posición espacial).
- Reconocimiento de audio y voz (ASR) con reconocimiento de hablante y frase reportado al 100 %.
- Síntesis de voz (TTS) a 16 kHz mediante cabeza vocoder polar.
- Razonamiento sobre rejillas espaciales 2D de tipo ARC-AGI-2 (grids toroidales).
- Recuperación cross-modal zero-shot entre modalidades (visión-texto, audio-voz, grid-texto).
- Razonamiento multi-vista socrático: cinco perspectivas (`GLOSS`, `SEE`, `SAY`, `DO`, `KNOW`) alineadas en el mismo espacio latente.
- Predicción latente JEPA multi-salto mediante un predictor de transición sin capas lineales.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en representaciones platónicas: el modelo permite reproducir y extender los experimentos de alineación `SO(D)` entre modalidades, sirviendo como banco de pruebas para validar la hipótesis de representación platónica con arquitecturas libres de capas lineales.
- Recuperación cross-modal zero-shot: dado un vector latente de imagen, recuperar el concepto textual correspondiente sin entrenamiento emparejado, útil en sistemas de búsqueda multimodal donde no se dispone de pares anotados.
- Reconocimiento y síntesis de voz en pipelines embebidos: con solo 3,3 M de parámetros en la torre de audio y 47 K en la cabeza vocoder, puede desplegarse en dispositivos con recursos muy limitados para transcripción y generación de voz a 16 kHz.
- Prototipado de world models para razonamiento espacial: la torre de rejillas 2D permite experimentar con tareas de tipo ARC-AGI-2 y transferir reglas simbólicas entre representaciones grid y texto.
- Educación e investigación en arquitecturas ortogonales: al no contener capas lineales ni convolucionales, es un caso de estudio didáctico para explorar transformers rotacionales y factorizaciones de Givens en cursos de aprendizaje profundo.
- Evaluación de eficiencia muestral en JEPA: el modelo documenta una ventaja de más de 42× en eficiencia muestral de vistas "buenas" frente a vistas "malas", lo que lo hace adecuado como referencia en estudios comparativos de regímenes de entrenamiento autosupervisado.
- Análisis de alineación multimodal en investigación de seguridad: permite estudiar cómo distintas modalidades convergen o divergen en el espacio latente, útil para auditar sesgos de representación entre sentidos.

## Benchmarks y rendimiento

Alineación platónica `SO(D)` por modalidad (verificación de arXiv:2610.39302):

| Modalidad | mKNN (k=10) | Linear CKA | Procrustes `SO(D)` | det(Q_m*) | Deriva Givens | Top-1 zero-shot |
|---|---|---|---|---|---|---|
| TEXT | 0,9854 | 0,9999 | 0,9999 | +1,0000 | 1,16e-14 | 100,0 % |
| VISION | 0,9833 | 0,9999 | 0,9999 | +1,0000 | 1,26e-14 | 100,0 % |
| AUDIO_ASR | 0,9854 | 0,9999 | 0,9999 | +1,0000 | 1,28e-14 | 100,0 % |
| SPEECH_TTS | 0,9833 | 0,9999 | 0,9999 | +1,0000 | 1,28e-14 | 100,0 % |
| GRID_2D | 0,9854 | 0,9999 | 0,9999 | +1,0000 | 1,33e-14 | 100,0 % |

Recuperación cross-modal y cross-vista zero-shot:

| Origen | Destino | Top-1 |
|---|---|---|
| VISION | TEXT | 100,0 % (48/48) |
| AUDIO_ASR | SPEECH_TTS | 100,0 % (48/48) |
| GRID_2D | TEXT | 100,0 % (48/48) |
| SEE | DO | 100,0 % (48/48) |
| GLOSS | KNOW | 100,0 % (48/48) |

Comparativa de regímenes de entrenamiento (Good-View vs Bad-View):

| Régimen | Presupuesto | mKNN | Linear CKA | Procrustes | Top-1 cross-view |
|---|---|---|---|---|---|
| Good-View JEPA | 1× | 0,9193 | 0,9628 | 0,9718 | 100,00 % |
| Bad-View JEPA | 1× | 0,3411 | 0,5621 | 0,2512 | 45,83 % |
| Ventaja (Δ) | Igual | +0,5781 | +0,4007 | +0,7206 | +54,17 % |

Capacidades perceptivas y de síntesis:

| Capacidad | Métrica | Resultado |
|---|---|---|
| Descripción visual y grounding | Perplejidad held-out / precisión color y posición | 1,18 PPL / 95,8 % |
| Reconocimiento de audio y voz | Perplejidad held-out / precisión voz y frase | 1,10 PPL / 100,0 % |

No se han publicado resultados en benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~54,4 M de parámetros almacenados, en fp32 ocuparía unos 218 MB y en fp16 unos 109 MB de pesos; el pico real de memoria depende del tamaño de lote y de las activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 quedan sobredimensionadas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.), e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` y con *endpoints*; no se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-1-Omni | ~54,4 M (~135 M equiv.) | 2.048 | Texto, visión, audio, TTS, grid 2D | Apache 2.0 | Hugging Face |
| S1-Omni | no disponible | no disponible | Multimodal científico | no disponible | arXiv:2607.15686 |
| Modelos any-to-any de gran escala (p. ej. familia Qwen-Omni) | no disponible en esta ficha | no disponible | Texto, visión, audio | no disponible | no disponible |

La comparación directa con modelos any-to-any de producción no es posible con los datos disponibles: HELMHOLTZ-1-Omni opera en un régimen de escala dos o tres órdenes de magnitud inferior y su objetivo es la validación de una hipótesis teórica, no la competición en benchmarks de propósito general.

## Limitaciones y advertencias

- Escala muy reducida (~54,4 M de parámetros): la calidad de generación de texto libre y de razonamiento complejo será previsiblemente muy inferior a la de modelos de miles de millones de parámetros; no debe evaluarse con los mismos criterios.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe ni de calidad en castellano.
- Los benchmarks reportados son internos y orientados a validar la alineación platónica (mKNN, CKA, Procrustes) sobre conjuntos pequeños (48 muestras en recuperación); no son comparables con benchmarks estándar de la comunidad.
- Riesgo de alucinación: no evaluado en la información disponible; en un modelo de esta escala y con objetivos de investigación, el riesgo es alto en generación abierta.
- Sesgos conocidos: no documentados en la model card; la composición del dataset de entrenamiento no se detalla, lo que impide auditar sesgos.
- El número de descargas y *likes* es cero en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la madurez del modelo y la falta de documentación sobre datos de entrenamiento desaconsejan su uso en producción sin una evaluación propia exhaustiva.
- La terminología de la model card (referencias a arXiv:2610.39302, métricas con valores en el límite teórico) debe tratarse con cautela: conviene verificar de forma independiente las afirmaciones antes de basar decisiones técnicas en ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-1
- Artículo referenciado (Platonic Representation Hypothesis con JEPAs): https://arxiv.org/abs/2610.39302
- S1-Omni (resultado de búsqueda relacionado): https://arxiv.org/abs/2607.15686
- Helmholtz AI (plataforma homónima, sin relación confirmada con MatterWaveAI): https://www.helmholtz.ai/
