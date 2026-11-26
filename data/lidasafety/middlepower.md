# LidaSafety/middlepower

## Resumen

Middlepower es un conjunto de pesos publicado por LidaSafety que implementa un simulador de cómo Estados Unidos y China responden a propuestas de supervisión de IA de frontera presentadas por potencias medias. No es un modelo de lenguaje entrenado desde cero, sino una colección de artefactos de dos familias: modelos estadísticos bayesianos ajustados sobre decisiones diplomáticas registradas y adaptadores LoRA PEFT para modelos Qwen (Qwen2.5-7B-Instruct y Qwen3-8B). El objetivo declarado es servir como herramienta de ensayo de negociación, no como sistema de predicción.

El componente estadístico se ajusta sobre 247.001 decisiones de 195 países en 1.802 resoluciones de la ONU y declaraciones sobre IA hasta 2026, e incorpora 35 factores aprendidos con pesos por país y términos de administración estadounidense y voto registrado. Los adaptadores LoRA (rango 16 sobre todas las proyecciones de atención y MLP) se organizan en niveles A, B y C: desde aprendices condicionados por el perfil bayesiano de cada país hasta un aprendiz extremo a extremo que codifica los 35 factores y emite una decisión.

Su relevancia es de nicho: cubre gobernanza de IA y relaciones internacionales con un enfoque cuantitativo poco habitual, pero con descargas y likes nulos, licencia no especificada y advertencias explícitas de sobrepredicción (76 % de asentimiento estadounidense predicho frente al 43 % observado en 21 textos posteriores a 2025). El repositorio ocupa 2,8 GB y no declara pipeline ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA PEFT (rango 16, todas las proyecciones de atencion y MLP) sobre Qwen2.5-7B-Instruct y Qwen3-8B; modelos estadisticos bayesianos independientes en formato NumPy/JSON |
| Parametros totales | No disponible para los adaptadores (el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones; Qwen3-8B, 8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Archivos `.tgz` con adaptadores PEFT y ficheros de tokenizer; `.npy` (vectores de parametros planos) y `.json` (pesos, factores y metadatos) para los modelos estadisticos |

## Arquitectura y entrenamiento

La parte lingüística son adaptadores LoRA de rango 16 aplicados sobre todas las proyecciones de atención y MLP de Qwen2.5-7B-Instruct y Qwen3-8B, cargables con PEFT y `transformers`. Se distribuyen en archivos comprimidos: `tierA.tgz` (aprendiz condicionado por el perfil bayesiano de cada país), `tierA_s3.tgz` (partición triple: entrenamiento hasta 2022, validación 2023-2024, test 2025-2026), `tierB.tgz` (aprendices por actor para EE. UU. y China a partir de explicaciones de voto), `tierC.tgz` (aprendiz extremo a extremo que codifica los 35 factores, asigna contribuciones con signo y emite decisión, entrenado con decisiones hasta 2022), y adaptadores de agentes gubernamentales, negociadores y presentadores para ambos modelos base.

La parte estadística comprende un modelo bayesiano de aceptación ajustado sobre 247.001 decisiones de 195 países en 1.802 resoluciones de la ONU y declaraciones sobre IA hasta 2026, con pesos específicos por era y un término de voto registrado, además de variantes sin esos términos, ajustes año a año para back-testing (2018-2026) y un modelo híbrido de tratados con 6 palancas y 48 provisiones ajustado sobre 51.909 decisiones de participación en 274 tratados (ONU y OIT). Los datos de entrenamiento son registros públicos: votos y patrocinios de la Asamblea General de la ONU, firmas de declaraciones sobre IA, participación en tratados y flujos comerciales de UN Comtrade. Los códigos de factores fueron generados por un modelo de lenguaje y verificados contra un codificador ciego (F1 de 0,88 para el nivel C). No se documenta RLHF ni DPO.

## Capacidades

- Simulación de respuestas de EE. UU. y China ante propuestas de supervisión de IA de potencias medias, con puntuaciones de aceptación.
- Modelado bayesiano de aceptación por país: interceptos, precedente, alineamiento, voto reciente, administración y pesos de 35 factores.
- Back-testing año a año con ajustes entrenados solo con decisiones anteriores a cada año (2018-2026).
- Modelado de participación en tratados mediante 6 palancas y 48 provisiones, con efecto de arrastre (bandwagon) por cuota de exportaciones mundiales.
- Agentes gubernamentales y negociadores vía LoRA sobre Qwen2.5-7B-Instruct y Qwen3-8B (variantes leaders, leaders2, negotiators, rl1, rl2, srl1, srl2).
- Presentadores condicionados por la capa bayesiana (Qwen3-8B).
- Codificación automática de los 35 factores con contribución firmada por país decisor (nivel C).
- No se declaran capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido más allá de lo que aporten los modelos base.

## Casos de uso

- Ensayo de negociación multilateral: cargar el adaptador de negociador sobre Qwen2.5-7B-Instruct y simular rondas de propuestas de supervisión de IA, usando las puntuaciones bayesianas como referencia de plausibilidad de la respuesta estadounidense o china.
- Análisis de escenarios diplomáticos: consultar `bayes/weights_posterior_all.json` para obtener pesos por factor y país con desviaciones estándar posteriores, sin necesidad de ejecutar código.
- Investigación en gobernanza de IA: utilizar los ajustes walk-forward 2018-2026 para evaluar la estabilidad temporal de los factores que explican el asentimiento a declaraciones sobre IA.
- Estudio de participación en tratados: emplear `treaties/hybrid_weights.json` para estimar qué palancas y provisiones favorecen la adhesión de un Estado a un acuerdo, con bootstrap agrupado por tratado.
- Docencia y formación de negociadores: usar los presentadores condicionados por la capa bayesiana para generar explicaciones de voto sintéticas y contrastarlas con registros reales.
- Auditoría de modelos de decisión: comparar el nivel C (codificación automática de factores) con un codificador ciego humano para medir la calidad de la codificación (F1 0,88 declarado).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Brier, modelo de todos los países, decisiones de EE. UU. (2018-2026) | 0,072 |
| Brier, modelo de todos los países, decisiones de China (2018-2026) | 0,065 |
| Asentimiento estadounidense predicho vs observado tras 2025 (21 textos) | 76 % predicho / 43 % observado |
| F1 de codificación de factores, nivel C (frente a codificador ciego) | 0,88 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; como referencia, los adaptadores LoRA requieren cargar el modelo base completo (Qwen2.5-7B-Instruct o Qwen3-8B), lo que en precisión de 16 bits supone aproximadamente 15-16 GB.
- GPU recomendadas: no declaradas; por tamaño del base, una A100 40 GB, H100 o L40S cubren la carga en fp16 con holgura para contexto largo.
- Compatibilidad con GPU de consumo: no confirmada por el autor; en teoría una RTX 4090 (24 GB) podría alojar el base en fp16 o cuantizado, pero no se documenta.
- Despliegue: PEFT + `transformers` (ejemplo oficial en la model card); vLLM se menciona solo para señalar que `tierB_B2_s3.tgz` provocó un fallo en la primera petición en las pruebas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LidaSafety/middlepower | LoRA r16 sobre Qwen2.5-7B-Instruct y Qwen3-8B | No disponible | Simulación de negociación EE. UU.-China en gobernanza de IA | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | No declarado en esta ficha | LLM generalista con instrucciones | No disponible en esta ficha | Ampliamente disponible |
| Qwen/Qwen3-8B | 8 mil millones | No declarado en esta ficha | LLM generalista con modo de razonamiento | No disponible en esta ficha | Ampliamente disponible |

No se dispone de información sobre otros modelos especializados en simulación de negociación internacional con los que comparar directamente.

## Limitaciones y advertencias

- Las puntuaciones son lecturas para ensayo de negociación, no pronósticos, según el propio autor.
- Sobreprecisión documentada: 76 % de asentimiento estadounidense predicho frente al 43 % observado en 21 textos posteriores a 2025.
- El modelo describe comportamiento estatal registrado y no representa las opiniones de ningún gobierno.
- Los efectos basados en tratados describen qué llevó a los Estados a adherirse a tratados; su traslado a negociaciones sobre IA es una suposición explícita.
- Los códigos de factores fueron generados por un modelo de lenguaje, con verificación parcial (F1 0,88 en nivel C); pueden contener errores sistemáticos.
- `tierB_B2_s3.tgz` provocó un fallo en vLLM en la primera petición durante las pruebas del autor.
- Licencia no especificada: no hay autorización explícita para uso comercial.
- Sin descargas ni likes, sin pipeline declarado y sin idiomas declarados; madurez y soporte comunitario nulos.
- Sesgos conocidos: no documentados más allá de la sobrepredicción señalada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LidaSafety/middlepower
- Repositorio de código: https://huggingface.co/LidaSafety/middlepower-code
- Manuscritos: https://huggingface.co/LidaSafety/middlepower
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
