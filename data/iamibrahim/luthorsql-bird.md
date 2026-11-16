# IAMIbrahim/luthorsql-bird

## Resumen

LuthorSQL (variante `luthorsql-bird`) es un sistema de text-to-SQL construido como un conjunto de adaptadores LoRA sobre el modelo base `seeklhy/OmniSQL-7B`. Lo desarrolla Ibrahim Memon y colaboradores (Ibrahim Memon, Armin Karamzade, M. Hanif Jhaveri y Roy Fox), y su propuesta central es radical: el modelo no genera SQL token a token, sino que rellena en una sola pasada un plan de consulta tipado mediante cabezas especializadas, que después se compila a SQLite.

El repositorio contiene dos adaptadores: `r1/`, un generador que produce hasta 32 planes candidatos en una única pasada forward, y `valhard_rr/`, un validador que puntúa cada candidato ejecutado y selecciona el de mayor puntuación que devuelva un resultado no nulo. El modelo está pensado como "System 1" rápido dentro de una arquitectura en cascada, donde un LLM más lento (por ejemplo, Claude Opus) solo se invoca para las preguntas dudosas.

La relevancia actual reside en su rendimiento en BIRD: 59,39 de exactitud de ejecución (EX) en BIRD dev y 68,03 en el test oculto ejecutado por el equipo de BIRD, con una latencia mediana de 0,84 segundos por pregunta en una H100 PCIe. Es un modelo de investigación en estado de pre-release privado, con licencia aún no decidida y prevista para uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only OmniSQL-7B; generación por cabezas de plan tipado en una pasada |
| Parametros totales | 7B en el backbone base (OmniSQL-7B); tamaño de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (mencionado para Apple silicon, ~9 GB con ambos adaptadores); otros no disponibles |
| Idiomas soportados | inglés únicamente |
| Licencia | other (no decidida; prevista solo para investigación) |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Tamaño del repo | 0,3 GB |
| Modelo base | seeklhy/OmniSQL-7B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se apoya en OmniSQL-7B, un transformer decoder-only de 7.000 millones de parámetros, sobre el que se añaden dos conjuntos de adaptadores LoRA. El generador (`r1/`) no emite SQL secuencialmente: sus cabezas de slot rellenan un plan de consulta tipado en una sola pasada forward, y el código del proyecto enumera hasta 32 planes candidatos y los compila a SQLite. El validador (`valhard_rr/`) puntúa cada candidato ya ejecutado y devuelve el de mayor puntuación que se ejecute y produzca un resultado no nulo. Esta separación generador/validador sustituye la decodificación autorregresiva de SQL por una búsqueda sobre planes compilables.

Los datos de entrenamiento incluyen BIRD train, Spider train y una muestra de SynSQL-2.5M; el validador usó además etiquetas de BIRD-Platinum, para las que el autor indica que no se encontró licencia. No se detalla en la información disponible el número total de tokens de entrenamiento ni si hubo RLHF o DPO. La gramática del plan cubre el 84,6 % de las consultas gold de BIRD dev, lo que acota intrínsecamente el techo de acierto del generador.

## Capacidades

- Text-to-SQL de una pasada: genera un plan de consulta tipado y lo compila a SQLite sin escribir SQL token a token.
- Generación de múltiples candidatos (hasta 32 planes) y selección mediante un validador que puntúa candidatos ejecutados.
- Ejecución y filtrado: el validador exige que el candidato se ejecute y devuelva un resultado no nulo.
- Traducción de dialecto SQL: sin reentrenamiento, la salida SQLite se traduce a Snowflake, BigQuery, MySQL, PostgreSQL y DuckDB, con una caída de rendimiento de 57,1–59,3 % frente al 60,17 % en SQLite sobre BIRD dev.
- Uso como System 1 en cascada con un LLM más lento mediante API (umbral 3.0, reenviando solo preguntas dudosas).
- Capacidad de ejecución en 8 bits y en Apple silicon (~9 GB con ambos adaptadores sobre un backbone en 8 bits, misma precisión).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking más allá del rol de System 1 en cascada.

## Casos de uso

- Atención al cliente con consultas a base de datos: el modelo traduce preguntas en lenguaje natural a SQL sobre SQLite en menos de un segundo, adecuado para responder consultas de usuarios en tiempo real sin un LLM grande en el camino crítico.
- Analítica de autoservicio sobre PostgreSQL o MySQL: la salida SQLite se traduce a estos dialectos con una precisión de 57,1–59,3 % en BIRD dev, suficiente para asistentes de BI que sugieren consultas y dejan la validación final al usuario.
- Enrutamiento en cascada para reducir costes: usar LuthorSQL como System 1 y reenviar solo las preguntas dudosas a un modelo grande; el autor reporta un 33,3 % de ahorro frente a Opus solo con igual precisión en 227 preguntas sobre bases de datos posteriores al corte de entrenamiento de Opus.
- Evaluación y benchmarking de text-to-SQL: sirve como referencia de un enfoque no autorregresivo en BIRD, útil para investigadores que comparan paradigmas de generación de SQL.
- Prototipado de asistentes de datos en local: con ~9 GB en 8 bits y soporte de Apple silicon, permite desplegar un text-to-SQL funcional en un portátil para demos y pruebas internas.
- Generación de consultas sobre DuckDB y Snowflake en pipelines de datos: la traducción de dialecto sin reentrenamiento permite integrar el modelo en flujos ETL donde la consulta se genera y se valida antes de ejecutarse.
- Investigación sobre planes tipados: la gramática de plan y el validador son un banco de pruebas para estudiar la cobertura gramatical (84,6 % en BIRD dev) y su impacto en la exactitud.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BIRD dev (gold original, 1.534 preguntas) | 59,39 EX |
| BIRD hidden test (equipo BIRD, 1.789 preguntas) | 68,03 EX |
| BIRD dev, salida SQLite | 60,17 % |
| BIRD dev, SQLite traducido a Snowflake/BigQuery/MySQL/PostgreSQL/DuckDB | 57,1–59,3 % |
| Latencia mediana (H100 PCIe) | 0,84 s por pregunta |
| Cascada con Claude Opus 5.5 (227 preguntas, umbral 3.0) | 33,3 % más barato que Opus solo, igual precisión |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~9 GB con ambos adaptadores sobre un backbone de 7B en 8 bits (dato del autor para Apple silicon); en FP16 el backbone de 7B requiere del orden de 14–16 GB, aunque el autor no lo especifica.
- GPU recomendadas: H100 PCIe (usada para la medición de latencia de 0,84 s); no se documentan mediciones en A100 ni en RTX 4090.
- GPU de consumo: cabe en GPUs consumer con 16 GB o más en 8 bits; el autor confirma funcionamiento en Apple silicon con ~9 GB.
- Despliegue: la librería es PEFT; el código de inferencia está en el repositorio privado `IAMIbrahimmemon/luthorsql`, por lo que no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 0,84 s por pregunta (mediana) en una H100 PCIe; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LuthorSQL (este) | 7B + LoRA | no disponible | 59,39 EX (60,17 % SQLite) | other, solo investigación | pre-release, repo privado |
| OmniSQL-7B (base) | 7B | no disponible | no disponible en la información | no disponible | público en Hugging Face |
| Modelos text-to-SQL autorregresivos de 7B | ~7B | no disponible | no disponible | variable | públicos |

No se dispone en la información proporcionada de resultados comparables de otros modelos text-to-SQL concretos sobre BIRD dev, por lo que la comparativa cuantitativa con alternativas queda limitada al modelo base y a la categoría general.

## Limitaciones y advertencias

- Solo inglés: el autor declara explícitamente que el modelo funciona únicamente en inglés.
- Solo joins por clave foránea: los joins utilizan claves declaradas e inferidas por nombre, lo que excluye joins más complejos.
- Cobertura gramatical limitada: la gramática del plan cubre el 84,6 % de las consultas gold de BIRD dev, lo que impone un techo estructural de acierto.
- Licencia no decidida: prevista solo para investigación; no hay autorización documentada para uso comercial.
- Datos de entrenamiento con licencia incierta: el validador usó etiquetas de BIRD-Platinum para las que el autor no encontró licencia, lo que supone un riesgo legal para su reutilización.
- Estado pre-release privado: el código está en un repositorio privado y el modelo no tiene descargas ni validación externa; el pipeline no está declarado en Hugging Face.
- Riesgo de alucinación: el validador mitiga parcialmente los candidatos inválidos exigiendo ejecución y resultado no nulo, pero no garantiza la corrección semántica de la consulta.
- Sin datos de sesgo publicados ni evaluaciones de robustez fuera de BIRD.
- La cascada con Claude Opus 5.5 se midió en un test registrado de 227 preguntas; el ahorro del 33,3 % no está validado a mayor escala.

## Enlaces

- Hugging Face: https://huggingface.co/IAMIbrahim/luthorsql-bird
- Modelo base: https://huggingface.co/seeklhy/OmniSQL-7B
- Paper: https://arxiv.org/abs/2611.17780
- Repositorio de código (privado): `IAMIbrahimmemon/luthorsql` en GitHub
