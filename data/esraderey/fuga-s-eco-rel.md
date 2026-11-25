# esraderey/fuga-s-eco-rel

## Resumen

FUGA-S eco_rel es un modelo de lenguaje simbólico-musical de 151,6 millones de parámetros desarrollado por el usuario esraderey y publicado bajo licencia MIT. Se trata de un transformer solo decodificador entrenado para generar piezas tonales de 8 a 16 compases en formato de notas cuantizadas (12 ticks por negra), con operadores explícitos de repetición (ECO/ECOR) y un marco tonal relativo. El modelo forma parte del proyecto FUGA, cuyo código y experimentos están disponibles en GitHub, y se acompaña de un intérprete determinista (FUGA-I) que renderiza las partituras generadas a MIDI y WAV.

El checkpoint publicado corresponde a `modelo_mejor.pt` de la corrida `wsd_4500`, es decir, el punto de menor bits por nota en validación parcial durante el entrenamiento (paso 4250 de 4500), no el modelo final. Alcanza 3,362 bits por nota en validación completa (617 piezas) y 3,645 en test (631 piezas), métricas que mejoran de forma clara las referencias internas del proyecto (FUGA-S a 700 pasos: 4,49/4,87; nano de 2,5M: 5,25 en validación). Es relevante ahora porque demuestra que un modelo pequeño, entrenado con un presupuesto modesto (35,9M de tokens sobre un corpus de dominio público de 14.955 piezas), puede producir música simbólica tonal con una fidelidad estadística razonable y sin copiar ventanas del corpus de entrenamiento según el detector del propio proyecto.

La propuesta es deliberadamente acotada: no es un modelo de audio ni un generador de audio neuronal, sino un modelo de partituras que requiere un renderizador posterior. Su interés técnico reside en la combinación de tokenización por compás y parte, decodificación restringida por gramática y un esquema de repetición explícita que reduce la longitud efectiva de la secuencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer solo decodificador con RMSNorm, RoPE (un eje por índice de compás en una cabeza kv), GQA, QK-norm, SwiGLU y embeddings atados |
| Parámetros totales | 151.590.912 (151,6M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de música simbólica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json`; el proyecto menciona también `modelo_mejor.pt` como checkpoint de origen |

## Arquitectura y entrenamiento

El modelo es un transformer solo decodificador con normalización RMSNorm, embeddings rotatorios (RoPE) con un eje dedicado al índice de compás en una cabeza kv, atención con consultas agrupadas (GQA), QK-norm, activación SwiGLU y embeddings atados entre entrada y salida. La tokenización opera por compás y parte, e incorpora operadores ECO/ECOR para representar repeticiones de forma explícita, junto con un marco tonal relativo (modo `eco_rel`). La decodificación en inferencia está restringida por gramática, lo que evita secuencias sintácticamente inválidas.

El entrenamiento se realizó sobre 14.955 piezas de dominio público extraídas del corpus de music21 (principalmente essenFolksong con 8.514 piezas, oneills1850 con 2.009 y palestrina con 1.318, además de bach, airdsAirs, ryansMammoth y otras fuentes), con partición estable por libro de origen. Se vieron 35,9M de tokens en 4.500 pasos con AdamW (lr 0,0006, decaimiento 0,1, dropout 0,3) y un schedule WSD, en bf16 sobre CUDA. El checkpoint publicado es el paso 4250, seleccionado por una regla pre-registrada (menor bits por nota en validación completa entre `modelo_mejor.pt` y `modelo.pt` de todas las corridas), sin intervención del conjunto de test. El contraste pre-registrado entre el mejor presupuesto corto y el mejor checkpoint de la corrida larga, pareado por pieza en test (475 piezas), arroja −0,0897 [−0,1035; −0,0758] bits por nota, con IC95 por debajo de cero.

## Capacidades

- Generación de música simbólica tonal en piezas de 8 a 16 compases, con notas cuantizadas a 12 ticks por negra.
- Representación explícita de repeticiones mediante operadores ECO/ECOR, lo que permite estructuras musicales recurrentes sin duplicar tokens.
- Marco tonal relativo (`eco_rel`): el modelo trabaja con relaciones tonales en lugar de alturas absolutas, lo que facilita la transposición y la coherencia armónica.
- Decodificación restringida por gramática: la salida siempre es una secuencia válida según el formalismo del tokenizador.
- Control de estilo interpretativo en el renderizado posterior mediante el intérprete FUGA-I (`plano`, `neutro`, `romantico`, `mecanico`), que produce MIDI y WAV.
- Muestreo configurable por temperatura y top-p (las muestras publicadas usan temperatura 1,0 y top-p 0,95).
- No soporta tool calling, function calling, agentes, visión, audio de entrada, ni capacidades multilingües de lenguaje natural; es un modelo de un solo dominio.

## Casos de uso

- Generación de bocetos musicales para composición: el modelo produce piezas de 16 compases con una estructura tonal coherente (96,8 % de notas en la escala declarada en las muestras publicadas), útiles como punto de partida para un compositor humano que después edite el MIDI.
- Creación de música de fondo para prototipos y demos: al renderizar a WAV con el intérprete FUGA-I en estilo `neutro` o `romantico`, se obtienen pistas breves y libres de derechos según la licencia MIT, adecuadas para maquetas de videojuegos o aplicaciones.
- Investigación en generación musical simbólica: el modelo sirve como línea base reproducible de 151,6M de parámetros con métricas de bits por nota documentadas (3,362 en validación, 3,645 en test) y un protocolo de selección pre-registrado, lo que facilita comparaciones rigurosas.
- Estudio de tokenizaciones con operadores de repetición: la combinación ECO/ECOR y el marco tonal relativo son un caso de estudio concreto sobre cómo reducir la longitud efectiva de secuencia en música simbólica, reutilizable en otros proyectos.
- Educación musical y análisis: la generación de piezas en modo mayor o menor con una escala declarada permite usar el modelo para ilustrar conceptos de tonalidad, repetición y estructura en entornos docentes.
- Generación de datasets sintéticos de partituras: las salidas en MIDI pueden emplearse para aumentar corpus de entrenamiento de otros modelos simbólicos, siempre que se verifique la originalidad según el detector del proyecto.
- Pruebas de pipelines de renderizado MIDI a audio: el par modelo + intérprete permite validar cadenas de conversión simbólica a audio con estilos expresivos controlados.

## Benchmarks y rendimiento

| Conjunto | Bits por nota |
|---|---|
| Validación completa (617 piezas) | 3,362 |
| Test completo (631 piezas) | 3,645 |

Referencias internas del proyecto sobre los mismos conjuntos: FUGA-S a 700 pasos 4,49 (validación) / 4,87 (test); modelo nano de 2,5M, 5,25 (validación). El checkpoint publicado es el de menor bits por nota en validación entre todos los evaluados en la tabla de selección del autor.

Métricas de muestras sobre 12 piezas de 16 compases (semillas 0 a 11, temperatura 1,0, top-p 0,95):

| Medida | Generado | Real (test frente a train) |
|---|---|---|
| Copia de ventanas de 4 compases presentes en train | 0,000 (máximo por pieza) | 0,052 |
| Copia de ventanas de 2 compases | 0,000 | 0,092 |
| Notas en la escala declarada | 0,968 | 0,957 |
| Repetición de segmentos (ventana de 32 compases) | 0,177 | 0,243 |
| Piezas en modo mayor | 9 de 12 | 73 % del corpus |

No se han publicado resultados de benchmarks estándar de música (por ejemplo, MMLU, HumanEval o GSM8K no aplican a este dominio) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 151,6M de parámetros, en fp32 los pesos ocupan aproximadamente 0,6 GB; en bf16, unos 0,3 GB. El repo pesa 0,6 GB, coherente con pesos en fp32 o bf16 más artefactos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se entrenó en CUDA con bf16, por lo que se beneficia de GPU con soporte bf16 (Ampere en adelante: A100, H100, RTX 30xx/40xx).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para generación de pocas piezas.
- Opciones de despliegue: el proyecto proporciona el paquete `fuga/` con `fuga.sample` para CLI y carga desde Python (`cargar_modelo`, `generar`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de dominio específico con tokenizador propio y decodificación restringida por gramática, estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FUGA-S eco_rel (este) | 151,6M | 1024 tokens | Música simbólica tonal, ECO/ECOR, marco relativo | MIT | Hugging Face + GitHub |
| FUGA-S a 700 pasos (referencia interna) | no disponible | no disponible | Misma familia, menos entrenamiento | MIT | Referencia en la model card |
| FUGA nano | 2,5M | no disponible | Misma familia, mucho menor | MIT | Referencia en la model card |

No se dispone de datos de benchmarks comparables con otros modelos de música simbólica de terceros en la información proporcionada; la comparativa se limita a las referencias internas del proyecto FUGA documentadas por el autor.

## Limitaciones y advertencias

- Corpus pequeño (aproximadamente 2 millones de notas, 14.955 piezas): el modelo se sobreajusta en pocas épocas, y el checkpoint publicado se eligió precisamente por validación parcial, no por ser el modelo final de la corrida.
- Riesgo de alucinación musical: aunque las muestras publicadas no copian ventanas de 2 ni 4 compases del corpus de entrenamiento según el detector del proyecto, el modelo aprende de obras concretas; el autor recomienda comprobar las fuentes antes de usos que exijan originalidad garantizada.
- Sesgo de estilo y modo: 9 de 12 piezas generadas están en modo mayor, frente al 73 % del corpus real; el repertorio está dominado por folk (essenFolksong, oneills1850) y polifonía renacentista/barroca (palestrina, bach), con presencia mínima de música del siglo XIX y XX.
- Limitación de contexto: 1024 tokens restringen la longitud y complejidad estructural de las piezas; el modelo está pensado para 8-16 compases, no para obras extensas.
- Idiomas: no aplica lenguaje natural; no se documentan capacidades multilingües.
- Restricciones de licencia: pesos y código bajo MIT, lo que permite uso comercial, pero la licencia no garantiza la originalidad de las salidas ni la ausencia de solapamiento con las obras de dominio público del corpus.
- Caveat de producción: el modelo no genera audio directamente; requiere el intérprete FUGA-I y un renderizador para obtener WAV, y no se documentan latencias, throughput ni estabilidad en despliegues de alta concurrencia.
- Fecha de creación indicada en el repo: 2026-11-25, dato que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/esraderey/fuga-s-eco-rel
- Repositorio del proyecto (código y experimentos): https://github.com/esraderey/fuga
- Corpus de origen (music21): no se proporciona enlace directo en la información disponible; el autor referencia el corpus de music21 y el script `scripts/extraer_corpus.py` del proyecto FUGA.
