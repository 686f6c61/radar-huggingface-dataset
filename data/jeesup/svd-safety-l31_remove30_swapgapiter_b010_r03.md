# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r03

## Resumen

`Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r03` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`. El autor lo ha comprimido con SVD-LLM hasta conservar el 70,0 % de los parámetros densos (se elimina el 30,01 %) y, a continuación, ha aplicado un proceso de edición iterativa denominado swap neutral en parámetros, guiado por la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos repartido en diez rondas. Este checkpoint concreto corresponde a la ronda 3 de 10, es decir, un artefacto intermedio de una ejecución más larga.

El problema que aborda no es el de ofrecer un asistente conversacional, sino el de caracterizar empíricamente cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte de que varias celdas de su retícula están deliberadamente degradadas en seguridad respecto al modelo base y de que ninguna debe tratarse como un asistente desplegable.

La relevancia actual del artefacto es metodológica: proporciona un punto de medida reproducible (semilla 42, presupuesto explícito, regla de selección documentada) con métricas de seguridad publicadas, como una tasa de éxito de ataque del 0,50 % en AdvBench y del 3,50 % en StrongREJECT, junto a un 36,25 % de sobrerrechazo macro. Sobre el modelo base de 8.030.261.248 parámetros no se documentan cambios de contexto ni de tokenizador, por lo que se heredan las características de Llama-3.1-8B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), heredada de `meta-llama/Llama-3.1-8B-Instruct`; pesos editados mediante SVD-LLM y swap de componentes |
| Parametros totales | 8.030.261.248 (recuento real de safetensors, idéntico al del modelo base denso) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según la documentación de Llama-3.1-8B-Instruct; no se especifica en la model card de este checkpoint |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin versiones cuantizadas |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (tamaño del repositorio: 16,1 GB) |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder-only denso de 8B parámetros con atención por grupos (GQA) y RoPE, correspondiente a la familia Llama 3.1 Instruct. Sobre ese modelo no hay entrenamiento adicional en el sentido habitual: la intervención es de compresión y edición de pesos. La compresión SVD-LLM elimina el 30,01 % de los parámetros densos mediante descomposición en valores singulares de las matrices de proyección, dejando una fracción de parámetros resultante de 0,6999.

Sobre el modelo comprimido se aplica un procedimiento de swap neutral en parámetros: en cada ronda se restauran 3.602 componentes y se expulsan otros 3.602, con un valor de intercambio `insert` (solo el valor de inserción) y una política de expulsión ordenada por sigma. Se han intercambiado 20.923.392 parámetros, el 0,30 % de los parámetros densos de proyección, en tres rondas de 0,1 % cada una sobre un presupuesto total previsto de 1,0 %. La regla de selección de componentes evaluada en esta celda es `gap_iter` y la semilla empleada es 42. No se documentan fases de RLHF, DPO ni ajuste supervisado posteriores a la edición; la alineación procede íntegramente del modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct, con la plantilla de chat de Llama 3.1.
- Razonamiento y respuesta a instrucciones en varios turnos, en la medida en que la compresión y la edición no los hayan degradado.
- Las capacidades de código y matemáticas no se documentan para este checkpoint; no hay benchmarks de utilidad (por ejemplo, HumanEval o GSM8K) publicados en la información disponible.
- Soporte de tool calling y function calling: no documentado en esta ficha, aunque la plantilla del modelo base lo contempla.
- Uso en agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades multilingües: no documentadas para el checkpoint; dependen del modelo base.
- Capacidad específica del artefacto: servir como sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresión, con métricas de tasa de éxito de ataque y de sobrerrechazo.
- No incluye modo de pensamiento explícito, visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint permite reproducir con semilla 42 la medición de cómo una compresión al 70 % degrada la resistencia a ataques, y comparar la celda `gap_iter` con otras reglas de selección de la misma retícula.
- Evaluación de arneses de red-teaming: sirve para validar pipelines de evaluación automática con jueces tipo HarmBench sobre AdvBench y StrongREJECT, ya que se publican tasas de éxito de ataque de referencia (0,0050 y 0,0350).
- Calibración de métricas de sobrerrechazo: con un 36,25 % de sobrerrechazo macro medido por WildGuard, es útil para ajustar umbrales de clasificadores de rechazo y estudiar falsos positivos sobre peticiones benignas.
- Estudios de interpretabilidad: el swap documentado (3.602 componentes restaurados y 3.602 expulsados, con expulsión ordenada por sigma) permite analizar qué subespacios de pesos sostienen el comportamiento de seguridad.
- Ablación y línea base en experimentos de edición de pesos: al ser una ronda intermedia (3 de 10) con presupuesto conocido, funciona como punto de control para estudiar la curva dosis-respuesta del presupuesto de restauración entre el 0,3 % aplicado y el 1,0 % previsto.
- Reproducción de pipelines de compresión SVD-LLM: sirve para verificar herramientas de descomposición y de reconstrucción de pesos sobre un transformer de 8B con licencia Llama 3.1.
- Docencia y formación en seguridad de modelos: como sujeto experimental etiquetado y claramente no desplegable, es adecuado para prácticas de evaluación de riesgos sin exponer un asistente real.

## Benchmarks y rendimiento

| Metrica | Valor | Direccion deseable | Juez / herramienta |
|---|---|---|---|
| AdvBench ASR | 0,0050 (0,50 %) | Menor es mejor | HarmBench judge |
| StrongREJECT ASR | 0,0350 (3,50 %) | Menor es mejor | HarmBench judge |
| Sobrerrechazo macro | 0,3625 (36,25 %) | Menor es mejor | WildGuard |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros), ni cifras comparativas del modelo base sin comprimir o de otras celdas de la retícula, por lo que no es posible calcular deltas de degradación con los datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de los pesos del repositorio: en torno a 16-17 GB solo para pesos, más memoria para caché KV y activaciones; presupuesto práctico de 20-24 GB para contextos moderados.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB, o GPUs de 24 GB como RTX 4090, RTX 3090 o L4 si se limita la longitud de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con precisión nativa y contexto contenido; con cuantización a 8 bits (aproximadamente 8-9 GB) o 4 bits (aproximadamente 5 GB) cabría también en RTX 4070 Ti, RTX 4060 Ti 16 GB o RTX 3060 12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (librería declarada en el repositorio), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, SGLang y servidores compatibles con la API de Hugging Face; para llama.cpp u Ollama sería necesaria una conversión previa a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r03` | 8.030.261.248 | 128.000 tokens (heredado) | AdvBench 0,0050; StrongREJECT 0,0350; sobrerrechazo 0,3625 | Llama 3.1 Community License | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.261.248 | 128.000 tokens | No se aportan cifras en la información disponible | Llama 3.1 Community License | Hugging Face, distribución oficial |
| Otros checkpoints comprimidos de la misma retícula del autor | No disponible | No disponible | No disponible | Llama 3.1 Community License | Referenciados implícitamente, sin identificadores aportados |
| Otros modelos de 8B con edición de seguridad (por ejemplo, variantes abliterated) | No disponible | No disponible | No disponible | Variable | No disponible |

La comparación cuantitativa con el modelo base no puede completarse porque la información proporcionada no incluye sus valores de AdvBench, StrongREJECT ni sobrerrechazo medidos con los mismos jueces.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la model card indica explícitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Degradación deliberada de seguridad en varias celdas de la retícula: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del estudio es cuantificarlo; esta celda concreta no está garantizada como equivalente al modelo base en comportamiento de seguridad.
- Sesgos: no se documenta ningún análisis de sesgo específico para este checkpoint; los sesgos del modelo base se heredan sin mitigación adicional.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión y el intercambio de componentes pueden alterar el comportamiento de forma no caracterizada fuera del eje de seguridad medido.
- Limitaciones de idioma: la model card no declara idiomas soportados para esta variante.
- Longitud de contexto: los 128.000 tokens son una característica del modelo base y no se verifican como preservados tras la edición de pesos.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` en el repositorio; existen obligaciones de atribución ("Built with Llama") y condiciones específicas para uso comercial y para despliegues con gran número de usuarios.
- Ausencia de métricas de utilidad: sin datos de MMLU, HumanEval o GSM8K no puede acotarse el coste en capacidades generales de la compresión y la edición.
- Estado del repositorio: 0 descargas y 0 likes, sin validación comunitaria independiente; el checkpoint es una ronda intermedia y no el resultado final de la ejecución prevista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 (referenciada en el repositorio como `LICENSE`): no se proporciona URL directa en la información disponible
- Política de uso Llama 3.1 (referenciada en el repositorio como `USE_POLICY.md`): no se proporciona URL directa en la información disponible
- Papers, blogs, repositorios o demos adicionales: no disponibles; la búsqueda web realizada no devolvió resultados relevantes para este modelo (los resultados obtenidos correspondían a contenidos de televisión sin relación alguna).
