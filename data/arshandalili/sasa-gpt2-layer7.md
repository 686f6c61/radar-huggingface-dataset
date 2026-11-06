# arshandalili/sasa-gpt2-layer7

## Resumen

SASA (Subspace-Aware Sparse Autoencoders) para GPT-2 small es un conjunto de autoencoders dispersos publicados por Seyed Arshan Dalili y Mehrdad Mahdavi en el articulo *Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability* (NeurIPS 2026). No es un modelo de lenguaje generativo, sino un artefacto de interpretabilidad mecanica: una coleccion de SAEs entrenados sobre el flujo residual que entra en el bloque 7 de GPT-2 small, con el objetivo de descomponer las activaciones internas en caracteristicas interpretables.

El repositorio incluye la arquitectura propuesta (SASA, con `topk_sasa`) junto con las lineas base con las que se compara: TopK, BatchTopK y Matryoshka SAEs, todas entrenadas sobre las mismas activaciones. Las variantes cubren anchos de diccionario de 12.288 a 49.152 columnas y valores de l0 entre 30 y 240, lo que permite estudiar el compromiso entre esparsidad, reconstruccion e interpretabilidad.

La relevancia es metodologica: SASA sustituye cada atomo decodificador unidimensional de un SAE clasico por un subespacio decodificador aprendido y aplica una esparsidad de grupo Top-s junto con un regularizador de norma nuclear. El paquete se distribuye con licencia MIT y se integra con `sae_lens` 6.25, lo que facilita su reproducibilidad y su uso en flujos de trabajo existentes de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder con subespacios decodificadores aprendidos (SASA, `topk_sasa`); lineas base TopK, BatchTopK y Matryoshka |
| Parametros totales | no disponible (depende de la variante; el diccionario va de 12.288 a 49.152 columnas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica al SAE; las activaciones se extraen de GPT-2 small con contexto 128 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo subyacente es GPT-2 small; el corpus de entrenamiento es OpenWebText) |
| Licencia | MIT |
| Formato de pesos | no disponible (carga via `sae_lens`; tamano del repo 7,9 GB) |

## Arquitectura y entrenamiento

SASA modifica el SAE clasico en dos puntos. En primer lugar, cada atomo decodificador unidimensional se reemplaza por un subespacio decodificador aprendido de rango `r` (valores 2, 4, 6 u 8 en las variantes publicadas). En segundo lugar, la esparsidad se impone a nivel de grupo mediante Top-s: un grupo es un conjunto de `r` columnas consecutivas y su activacion se define como la norma de su codigo, de modo que se abren los `s` grupos mayores de cada token y el l0 efectivo resulta `s · r`. Ademas, se anade un regularizador de norma nuclear que favorece subespacios de bajo rango y bien condicionados.

El entrenamiento se realiza sobre el flujo residual de entrada al bloque 7 de GPT-2 small, con activaciones extraidas de OpenWebText y contexto de 128 tokens. La mayoria de variantes usan 300 millones de tokens de entrenamiento; la variante `sasa_topk_r6_l060_w12288`, empleada para la comparacion con el SAE de GPT-2 de Bloom (2024), usa 150 millones. Las lineas base TopK, BatchTopK y Matryoshka se entrenan con el mismo presupuesto, y BatchTopK y Matryoshka se almacenan como SAEs JumpReLU con su umbral aprendido. No se documentan fases de RLHF ni DPO, al no tratarse de un modelo generativo.

## Capacidades

- Descomposicion de activaciones del flujo residual del bloque 7 de GPT-2 small en caracteristicas dispersas mediante `sae.encode(h)`.
- Reconstruccion aproximada de la activacion original a partir del codigo disperso con `sae.decode(codes)`.
- Analisis de caracteristicas agrupadas: cada grupo de `r` columnas consecutivas forma una unidad interpretable cuya activacion es la norma de su codigo.
- Control explicito de la esparsidad mediante el parametro l0 (de 30 a 240 columnas activas por token) y del ancho del diccionario (12.288, 24.576 o 49.152 columnas).
- Barrido sistematico de rangos (`r` = 2, 4, 6, 8) para estudiar el efecto del tamano del subespacio en la calidad de las caracteristicas.
- Comparacion directa contra lineas base TopK, BatchTopK y Matryoshka entrenadas bajo el mismo protocolo.
- Integracion con `sae_lens` 6.25 mediante el registro automatico de las arquitecturas SASA al importar el paquete `sasa`.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es un artefacto de interpretabilidad, no un modelo de proposito general.

## Casos de uso

- Analisis de circuitos en GPT-2 small: extraer activaciones del bloque 7 sobre un corpus de interes, codificarlas con `sasa_r6_l0120_w24576` y estudiar que grupos se activan por token para localizar caracteristicas asociadas a conceptos concretos.
- Investigacion en interpretabilidad comparada: usar las variantes SASA y las lineas base TopK, BatchTopK y Matryoshka del mismo repositorio para medir, con identico protocolo de entrenamiento, que arquitectura produce caracteristicas mas monosemanticas.
- Estudio del compromiso esparsidad-reconstruccion: barrer `sasa_r2_l030_w12288` hasta `sasa_r2_l0240_w12288` manteniendo fijo el ancho del diccionario para trazar curvas de reconstruccion frente a l0.
- Audicion de caracteristicas antes de editar el modelo: identificar grupos activos en prompts problematicos y documentar sesgos o comportamientos indeseados de GPT-2 a nivel de caracteristica.
- Reproduccion de resultados academicos: el codigo en `github.com/arshandalili/sasa` permite reentrenar y verificar las cifras del articulo de NeurIPS 2026 sobre GPT-2.
- Docencia y formacion: servir como ejemplo practico de SAE con subespacios en cursos de interpretabilidad mecanica, gracias a la API de `sae_lens` y a la disponibilidad de variantes con distinto rango y esparsidad.
- Extension a otros modelos: reutilizar el paquete `sasa` como referencia de implementacion para entrenar SAEs con subespacios sobre las activaciones de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la cuadricula de variantes (arquitectura, columnas, rango, grupos por token, l0 y tokens de entrenamiento) y remite al articulo de NeurIPS 2026 para las metricas comparativas, pero no incluye cifras numericas de reconstruccion, interpretabilidad ni comparaciones cuantitativas con las lineas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 7,9 GB e incluye mas de 50 SAEs; cada variante individual es mucho menor, pero no se publica el desglose por fichero.
- GPU recomendadas: no disponible. Para codificar activaciones de GPT-2 small (124 M parametros) basta una GPU consumer, pero no se documentan requisitos oficiales.
- Cabe en GPU consumer: previsiblemente si para el modelo subyacente y para SAEs individuales, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: `sae_lens` 6.25 con el paquete `sasa` importado para registrar las arquitecturas; las lineas base TopK, BatchTopK y Matryoshka se cargan como SAEs estandar de `sae_lens`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Columnas | l0 | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SASA (este repo) | `topk_sasa` con subespacios | 12.288-49.152 | 30-240 | 300 M (150 M en una variante) | MIT | Hugging Face + GitHub |
| TopK SAE (este repo) | SAE TopK clasico | 12.288-49.152 | 30-240 | 300 M | MIT | Hugging Face |
| BatchTopK SAE (este repo) | SAE BatchTopK (JumpReLU) | 12.288-49.152 | 30-240 | 300 M | MIT | Hugging Face |
| Matryoshka SAE (este repo) | SAE Matryoshka (JumpReLU) | 12.288-49.152 | 30-240 | 300 M | MIT | Hugging Face |
| SAE de GPT-2 de Bloom (2024) | SAE de referencia externo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es interna al repositorio: SASA frente a TopK, BatchTopK y Matryoshka con identico modelo base, capa y presupuesto de entrenamiento. El SAE de Bloom (2024) se cita como referencia externa para la variante `sasa_topk_r6_l060_w12288`, pero no se detallan sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; su unico uso es el analisis de activaciones internas de GPT-2 small.
- Esta atado a una capa concreta (bloque 7, `blocks.7.hook_resid_pre`) y a un modelo concreto (GPT-2 small); no es transferible directamente a otras capas o modelos.
- Las activaciones de entrenamiento se extrajeron con contexto de 128 tokens y sobre OpenWebText, lo que limita la distribucion de caracteristicas aprendidas a ese regimen.
- El sesgo del SAE hereda en parte el sesgo del corpus OpenWebText y el de GPT-2 small; no se documentan analisis de sesgo especificos.
- Riesgo de caracteristicas espurias o polisemanticas: la interpretabilidad de los grupos no esta garantizada y requiere validacion manual.
- No se publican metricas de reconstruccion ni de interpretabilidad en la model card, por lo que la evaluacion cualitativa queda en manos del articulo.
- La licencia MIT permite uso comercial del codigo y los pesos, pero no se especifican restricciones adicionales ni condiciones de atribucion mas alla de la licencia.
- El repositorio agrupa mas de 50 SAEs en 7,9 GB; la seleccion de la variante adecuada exige conocer el compromiso rango/esparsidad/ancho, que no se resume en la model card.
- Dependencia de `sae_lens` 6.25 y del paquete `sasa` del repositorio; cambios de version pueden romper la carga de las arquitecturas.

## Enlaces

- Hugging Face: https://huggingface.co/arshandalili/sasa-gpt2-layer7
- Repositorio de codigo: https://github.com/arshandalili/sasa
- Paquete `sasa`: https://github.com/arshandalili/sasa/tree/main/sasa
- Articulo: Dalili, S. A. y Mahdavi, M., *Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability*, NeurIPS 2026 (referencia bibliografica en la model card; no se proporciona URL directa)
