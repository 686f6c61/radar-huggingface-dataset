# quantile-labs/WazoCore-8B

## Resumen

WazoCore-8B es un modelo de lenguaje de 8.153 millones de parámetros desarrollado por Quantile Labs, especializado en yoruba, hausa e igbo (además de inglés). Se construye como un ajuste fino del modelo base NCAIR1/N-ATLaS, que emplea la arquitectura Llama-3, y su innovación principal no reside en el entrenamiento desde cero, sino en la extensión del vocabulario: añade 15.000 tokens byte-level BPE específicos para las tres lenguas nigerianas, lo que reduce el número de tokens necesarios para codificar texto en esos idiomas en aproximadamente un tercio.

El problema que resuelve es concreto y medible: el tokenizador heredado de Llama-3 está entrenado predominantemente en inglés, de modo que una palabra en yoruba requiere unos 2,9 tokens frente a 1,3 en inglés. Esa ineficiencia encarece el servicio, incrementa la latencia y consume ventana de contexto en cada petición en lenguas nigerianas. Con el vocabulario extendido, WazoCore codifica yoruba a 1,91 tokens por palabra, hausa a 1,34 e igbo a 1,56, con aceleraciones de generación de 1,61× a 1,72× medidas en CPU de portátil.

La versión publicada, v13, sustituye a WazoCore v6 y recupera buena parte del razonamiento matemático que se había degradado durante la adaptación del vocabulario: pasa de −11,6 a +1,1 puntos porcentuales en AfriMGSM respecto al modelo base. Se distribuye como GGUF cuantizado Q4_K_M de 5,0 GB, compatible con llama.cpp, LM Studio y pilas compatibles con la API de OpenAI, y está pensado para ejecutarse en local o en hardware on-premise con 8 GB de memoria o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3), ajuste fino de NCAIR1/N-ATLaS |
| Parametros totales | 8.153.141.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens declarados en el archivo; el autor recomienda fijar explícitamente un valor menor con `-c` |
| Tipos de cuantizacion | Q4_K_M (archivo publicado); pesos a plena precisión anunciados como próximos |
| Idiomas soportados | Yoruba (yo), hausa (ha), igbo (ig), inglés (en) |
| Licencia | N-ATLaS Open-Source Research and Innovation License |
| Formato de pesos | GGUF (librería `gguf`); safetensors anunciados para más adelante |
| Vocabulario | 143.256 tokens (128.256 del base, sin cambios en id ni embedding, más 15.000 nuevos) |
| Modelo base | NCAIR1/N-ATLaS |
| Desarrollador | Quantile Labs |
| Tamaño del repo | 5,0 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura transformer de Llama-3 del base N-ATLaS, con 32 capas transformer. La modificación estructural consiste en la extensión del vocabulario: se aprendieron 15.000 fusiones BPE a nivel de byte sobre texto en yoruba, hausa e igbo y se añadieron al tokenizador base, excluyendo las fusiones que partirían un carácter UTF-8. La entrada se normaliza a Unicode NFC. Los nuevos embeddings se inicializan a partir de la media de los embeddings de los subwords que los componen, lo que proporciona un punto de partida informado en lugar de aleatorio.

El ajuste fino es deliberadamente ligero: aproximadamente 80 minutos en una única A100. Solo se actualizan las filas de embedding nuevas y cuatro de las 32 capas transformer; las filas del vocabulario original permanecen congeladas y un término de divergencia KL ancla las predicciones al modelo base para preservar el comportamiento previo. Los datos de entrenamiento incluyen unas 24.000 peticiones de traducción del modelo base de frases de Wikipedia en inglés hacia y desde cada lengua, 23.662 pares de frases de traducciones profesionales de google/smol (CC BY 4.0), 5.831 soluciones de GSM8K auto-destiladas en yoruba, hausa, igbo e inglés (retenidas solo si la respuesta final era correcta) y texto de Wikipedia en las tres lenguas. La innovación destacable es, por tanto, la adaptación de vocabulario con anclaje KL, que permite ganar eficiencia de tokenización sin destruir las capacidades del base.

## Capacidades

- Generación de texto conversacional en yoruba, hausa, igbo e inglés.
- Traducción bidireccional inglés ↔ yoruba/hausa/igbo, con calidad medida mediante chrF++ sobre NTREX-128.
- Razonamiento matemático de nivel escolar en las cuatro lenguas (evaluado con AfriMGSM).
- Inferencia en lenguaje natural (evaluado con AfriXNLI).
- Tokenización eficiente de lenguas nigerianas: aproximadamente un tercio menos de tokens que el base.
- Compatibilidad con plantilla de chat y formato conversacional.
- Despliegue como reemplazo directo en llama.cpp, LM Studio y pilas compatibles con la API de OpenAI (`/v1/chat/completions`).
- Ejecución offline en máquinas con 8 GB de memoria o más.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Traducción profesional inglés-yoruba/hausa/igbo: el modelo traduce frases con calidad medida en chrF++ y con menos repeticiones degeneradas que la versión v6 (2 frente a 5 sobre 750 traducciones de prueba), lo que lo hace adecuado para pipelines de localización de contenido.
- Servicio de atención al cliente en lenguas nigerianas: al codificar cada palabra en aproximadamente 1,3-1,9 tokens en lugar de 2,1-2,9, el mismo presupuesto de contexto cubre conversaciones multi-turno más largas y reduce el coste por petición.
- Despliegue en hardware de gama media: el GGUF Q4_K_M de 5,0 GB cabe en equipos con 8 GB de memoria, lo que permite ofrecer generación en lenguas nigerianas en portátiles y servidores modestos sin GPU dedicada.
- Generación aumentada por recuperación sobre corpus en yoruba, hausa e igbo: la reducción de tokens por palabra libera ventana de contexto para incluir más documentos recuperados en cada consulta.
- Asistencia educativa y resolución de problemas matemáticos en lengua local: el modelo mantiene razonamiento aritmético en las tres lenguas (AfriMGSM entre 26,0 y 40,4 de precisión según idioma), útil para tutores automáticos.
- Sustitución directa del modelo base en pilas existentes: al conservar los 128.256 tokens originales sin cambios de id ni embedding y ser un GGUF Llama-3 estándar, se puede intercambiar en llama.cpp o LM Studio sin reescribir la integración.
- Procesamiento por lotes offline en entornos con conectividad limitada: la ejecución local sin dependencia de API encaja en organismos y organizaciones que operan con datos sensibles o sin red.

## Benchmarks y rendimiento

Todas las comparaciones son frente al modelo base N-ATLaS. Los intervalos son intervalos de confianza bootstrap pareados del 95 %.

| Metrica (WazoCore vs base) | Yoruba | Hausa | Igbo |
|---|---|---|---|
| Tokens por palabra | 2,87 → 1,91 | 2,12 → 1,34 | 2,53 → 1,56 |
| Aceleración de generación (palabras/s, CPU de portátil) | 1,63× | 1,61× | 1,72× |
| ΔchrF++, inglés → X, Q4_K_M | +3,1 (+2,0, +4,1) | −0,4 (−1,2, +0,4) | +0,3 (−1,3, +1,7) |
| ΔchrF++, inglés → X, held-out | +2,2 (+1,6, +2,8) | −0,4 (−0,9, 0,0) | +0,1 (−0,5, +0,7) |
| ΔchrF++, X → inglés, held-out | +0,2 (−0,4, +0,7) | −0,1 (−0,5, +0,4) | +0,9 (+0,5, +1,4) |
| AfriMGSM (WazoCore / base) | 37,2 / 33,6 | 40,4 / 38,8 | 26,0 / 28,0 |
| AfriXNLI (WazoCore / base) | 52,7 / 57,7 | 53,0 / 57,5 | 52,5 / 58,8 |

| Metrica agregada (vs base) | v6 | v13 |
|---|---|---|
| Razonamiento matemático (AfriMGSM) | −11,6 | +1,1 (−2,3, +4,4) |
| Inferencia en lenguaje natural (AfriXNLI) | −7,5 | −5,3 |
| Repetición degenerada (750 traducciones) | 5 | 2 |
| Salidas truncadas (750 traducciones) | 13 | 8 |

Notas de protocolo: la velocidad se midió con llama.cpp build 9430, Q4_K_M, CPU Apple M4, 20 prompts por idioma, pareados e intercalados, usando la versión v6 (que comparte tokenizador con v13); el throughput por token es equivalente y la ganancia procede íntegramente de secuencias más cortas. La traducción Q4_K_M usó 250 frases NTREX-128 por idioma; la evaluación held-out usó 1.497 frases NTREX-128 por idioma reservadas de todas las decisiones de entrenamiento y selección, a plena precisión. El razonamiento se midió con IrokoBench, zero-shot y plantilla de chat, a plena precisión.

## Requisitos de hardware

- VRAM/memoria estimada: el GGUF Q4_K_M ocupa 5,0 GB en disco; el modelo funciona en máquinas con 8 GB de memoria o más. La memoria de trabajo crece con la ventana de contexto configurada, por lo que conviene fijar `-c` explícitamente en lugar de dejar que se reserve para los 131.072 tokens declarados.
- GPU recomendadas: no se especifican en la información disponible. El ajuste fino se realizó en una única A100, pero no se documentan requisitos de inferencia en GPU.
- Cabe en GPU de consumo: no se confirma explícitamente; por tamaño (5,0 GB en Q4_K_M) es compatible con GPUs de consumo con 8 GB o más de VRAM, aunque el autor no publica una lista validada.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y pilas compatibles con la API de OpenAI. Validado en llama.cpp build 9430.
- Latencia y throughput: la aceleración de generación medida es de 1,61× a 1,72× en palabras por segundo en CPU Apple M4 respecto al base, derivada de la reducción de tokens. No se publican valores absolutos de tokens por segundo ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| WazoCore-8B (v13) | 8,15 B | 131.072 declarados | Yoruba, hausa, igbo, inglés | N-ATLaS Open-Source Research and Innovation License | GGUF |
| NCAIR1/N-ATLaS (base) | 8 B (arquitectura Llama-3) | no disponible | Lenguas africanas (no detallado) | no disponible en la información proporcionada | no disponible en la información proporcionada |
| WazoCore-8B-v6-long | 8 B (misma familia) | no disponible | Yoruba, hausa, igbo, inglés | N-ATLaS Open-Source Research and Innovation License | GGUF |

La comparación cuantitativa disponible se limita al modelo base y a la versión anterior v6: frente al base, WazoCore reduce tokens por palabra un 33 % aproximadamente y acelera la generación 1,6-1,7×, con traducción inglés→yoruba mejorada en +3,1 chrF++ (Q4_K_M) y ligeramente peor en hausa (−0,4). Frente a v6, la v13 recupera el razonamiento matemático (+1,1 frente a −11,6 en AfriMGSM relativo al base) y reduce repeticiones degeneradas y truncamientos. No se dispone de datos para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de un base entrenado con datos mayoritariamente en inglés y ajustarse con traducciones automáticas del propio base, puede heredar sesgos de esos corpus.
- Alucinación: el modelo se entrenó con soluciones auto-destiladas de GSM8K y traducciones generadas por el base; existe riesgo de errores factuales y de traducción, especialmente fuera de los dominios cubiertos (Wikipedia, smol, NTREX-128).
- Regresión en inferencia: AfriXNLI empeora respecto al base en las tres lenguas (52,7 vs 57,7 en yoruba; 53,0 vs 57,5 en hausa; 52,5 vs 58,8 en igbo), una pérdida agregada de −5,3 puntos que el autor reconoce y no elimina por completo.
- Traducción: la mejora no es uniforme; en hausa el cambio en chrF++ es ligeramente negativo (−0,4), y los intervalos de confianza en igbo incluyen el cero.
- Contexto: aunque el archivo declara 131.072 tokens, el autor advierte de que hay que fijar `-c` explícitamente para evitar que llama-server reserve memoria para el máximo; no se documenta la calidad a contextos muy largos.
- Idiomas: solo cubre yoruba, hausa, igbo e inglés; no se garantiza comportamiento en otras lenguas africanas ni en variantes dialectales.
- Licencia: la N-ATLaS Open-Source Research and Innovation License no es una licencia de código abierto estándar (OSI); el uso comercial puede estar restringido y debe revisarse antes de producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y solo se publica la cuantización Q4_K_M; los pesos a plena precisión están anunciados pero no disponibles.
- Entrada Unicode: la versión v13 normaliza a NFC las entradas con Unicode descompuesto, corrigiendo la pérdida de eficiencia de v6, pero las entradas no normalizadas de otro tipo no están documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantile-labs/WazoCore-8B
- Versión anterior v6: https://huggingface.co/quantile-labs/WazoCore-8B-v6-long
- Código y evaluación: https://github.com/Quantile-Labs/wazocore
- Protocolo de evaluación: https://github.com/Quantile-Labs/wazocore/blob/main/docs/METHOD.md
- Modelo base: https://huggingface.co/NCAIR1/N-ATLaS
- Sitio del desarrollador: https://quantilelabs.com/
- Dataset google/smol: https://huggingface.co/datasets/google/smol
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
