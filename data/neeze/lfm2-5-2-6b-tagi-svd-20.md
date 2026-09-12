# Neeze/LFM2.5-2.6B-TAGI-SVD-20

## Resumen

LFM2.5-2.6B-TAGI-SVD-20 es una versión comprimida del modelo base LiquidAI/LFM2.5-2.6B, publicada por el usuario Neeze en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión de pesos: se ha aplicado la técnica TAGI-SVD v2 (Two-Round SVD Whitening + Null-Space Side-States) para reducir un 20,0% el número de parámetros del modelo original, que pasa de 2,6B a los 2.209.741.824 parámetros que reportan los ficheros safetensors.

El interés técnico del repositorio no reside en el modelo en sí, sino en el método de compresión y en su coste en calidad. Según los datos de la propia model card, la perplejidad sube de 21,0 en el modelo original a 50,5 tras la compresión, lo que deja una "retención de calidad" declarada del 41,58%. Es, por tanto, un experimento de compresión con degradación severa, útil para investigar técnicas de poda y descomposición de bajo rango, pero no para uso en producción.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, está etiquetado con licencia "other" y no incluye información sobre idiomas soportados, contexto, pipeline declarado ni resultados de benchmarks más allá de la perplejidad. La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo o su método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM2 (convoluciones + atencion); 22 capas Conv y 8 capas Attention segun la model card |
| Parametros totales | 2.209.741.824 (dato de los ficheros safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo de 4,4 GB) |
| Modelo base | LiquidAI/LFM2.5-2.6B (2,6B parametros, 5,39 GB en BF16 segun la model card) |
| Metodo de compresion | TAGI-SVD v2 (Two-Round SVD Whitening + Null-Space Side-States) |
| Ratio de recorte de parametros | 20,0% |
| Rango lateral ortogonal (r_side) | 8 |
| Fecha de creacion en HuggingFace | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base LiquidAI/LFM2.5-2.6B, que la model card describe como una red de 30 capas distribuidas en 22 capas convolucionales y 8 capas de atención, con Rotary Position Embeddings (RoPE) en la parte atencional. No hay ningún entrenamiento adicional documentado: el proceso aplicado es exclusivamente de compresión de los pesos ya entrenados del modelo base.

El pipeline de compresión TAGI-SVD v2 combina tres componentes. Primero, un "Two-Round SVD Whitening" que blanquea la matriz de covarianza de activaciones calculada sobre entre 500.000 y 5 millones de tokens de calibración. Segundo, los "Null-Space Side-States" con rango lateral r_side = 8, que añaden canales auxiliares para compensar la energía eliminada por el recorte y, según el autor, evitar la divergencia de estado a lo largo de las 22 capas convolucionales. Tercero, un "RoPE Commutant Procrustes" que preserva la invariancia bajo el álgebra de Lie SO(2) de las 8 capas de atención, con el objetivo declarado de mantener la capacidad de procesar contexto largo.

No se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior a la compresión, ni la composición del dataset de calibración más allá del rango de tokens indicado.

## Capacidades

- Generación de texto: el modelo conserva el pipeline declarado de text-generation heredado del modelo base.
- Razonamiento y conocimiento general: potencialmente degradados de forma sustancial, dado el incremento de perplejidad de 21,0 a 50,5.
- Capacidad multilingüe: no disponible; no se especifican idiomas en la model card.
- Tool calling / function calling: no disponible; no hay ninguna mención a soporte de herramientas.
- Uso como agente o razonamiento multi-paso: no disponible; no documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no documentado.
- Interés como artefacto de investigación: reproduce un pipeline de compresión SVD con estados laterales en espacio nulo, útil para estudiar el equilibrio entre ratio de compresión y degradación de perplejidad.

## Casos de uso

- Investigación en compresión de modelos: el repositorio permite reproducir el pipeline TAGI-SVD v2 sobre un modelo híbrido conv+attention y comparar la curva perplejidad/ratio de recorte frente a otras técnicas de poda.
- Estudio de propagación de error en capas convolucionales: los "Null-Space Side-States" con r_side = 8 están diseñados específicamente para contener la divergencia de estado en 22 capas Conv, por lo que el modelo sirve como banco de pruebas para medir si esa estrategia funciona.
- Experimentos académicos sobre RoPE y contexto largo: el componente "RoPE Commutant Procrustes" busca preservar la invariancia SO(2) en las capas de atención; el modelo permite evaluar empíricamente si esa restricción mantiene el rendimiento en secuencias largas.
- Docencia y divulgación: ejemplo didáctico de cómo una reducción aparentemente modesta del 20% de parámetros puede multiplicar por 2,4 la perplejidad si la calibración no es adecuada.
- Baseline negativo en benchmarks internos: útil como referencia de "modelo comprimido con degradación conocida" contra la que comparar métodos de compresión futuros.
- Despliegue en entornos de muy bajos recursos con tolerancia al error: dado su tamaño de 4,4 GB en safetensors, puede ejecutarse en hardware modesto, aunque la calidad de salida limita su uso a tareas de formato o completado trivial donde la fidelidad no sea crítica.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de perplejidad:

| Metrica | Modelo original (LiquidAI/LFM2.5-2.6B) | LFM2.5-2.6B-TAGI-SVD-20 |
|---|---|---|
| Perplejidad (PPL) | 21,0 | 50,5 |
| Retencion de calidad declarada | 100% (referencia) | 41,58% |
| Parametros | 2,6B (segun model card) | 2.209.741.824 |
| Tamano de pesos | 5,39 GB (BF16) | 4,4 GB (repo safetensors) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estandar en la información disponible. No se especifica sobre qué conjunto de evaluación se calcularon las perplejidades ni con qué configuración de tokenización.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,5-5,5 GB solo para pesos, más el coste de la caché KV, que depende de una longitud de contexto no documentada.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo en FP16; una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 son suficientes. Para lotes grandes o contexto extenso se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas consumer de gama media y alta (RTX 3060 12 GB en adelante) en FP16 y con holgura en cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: al publicarse únicamente en safetensors, es directamente cargable con transformers. Para servirlo con vLLM, TGI o llama.cpp/Ollama sería necesario convertir los pesos a los formatos correspondientes, y no hay ninguna conversión oficial publicada.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-TAGI-SVD-20 (este) | 2.209.741.824 | no disponible | other | safetensors | PPL 50,5; retencion de calidad 41,58% |
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | no disponible en la informacion | no disponible en la informacion | safetensors/BF16 | PPL 21,0; referencia de calidad |
| Otras variantes comprimidas de la familia LFM2.5 | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la informacion proporcionada |

No se dispone de datos de benchmarks comparables con modelos de otros fabricantes (Qwen, Llama, Gemma) en la información proporcionada, por lo que no se incluye una comparación de rendimiento entre familias.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad se multiplica por 2,4 (de 21,0 a 50,5) y la retención de calidad declarada es del 41,58%. Es un modelo con un coste de compresión muy alto para un ahorro de parámetros de solo el 20%.
- Riesgo elevado de alucinacion: una perplejidad de 50,5 en el dominio de evaluación indica una distribución de probabilidad muy degradada, lo que se traduce en mayor incoherencia y fabricación de contenido.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluación de sesgos.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados, pese a que el método presume de preservar el manejo de contexto largo mediante "RoPE Commutant Procrustes".
- Licencia restrictiva o ambigua: la licencia figura como "other" sin texto adicional en la información disponible, por lo que el uso comercial queda en un estado jurídicamente indeterminado y requiere consultar los términos de la licencia del modelo base LiquidAI/LFM2.5-2.6B.
- Origen y mantenimiento: repositorio publicado por un usuario individual (Neeze) con 0 descargas y 0 likes; no hay garantía de mantenimiento, corrección de errores ni soporte.
- Ausencia de validacion independiente: los únicos números disponibles provienen de la propia model card del autor y no han sido verificados por terceros.
- Reproducibilidad incompleta: no se detalla el conjunto de calibración exacto (solo el rango de 500.000 a 5 millones de tokens), ni la configuración de evaluación de la perplejidad, lo que dificulta replicar los resultados.
- Formato único: al no publicarse GGUF ni cuantizaciones listas para llama.cpp u Ollama, el despliegue exige conversiones propias.
- No apto para produccion: por la combinacion de degradacion medida, licencia ambigua y falta de soporte, no se recomienda su uso en sistemas en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Neeze/LFM2.5-2.6B-TAGI-SVD-20
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper, blog o repositorio del metodo TAGI-SVD v2: no disponible
- Demo o espacio de inferencia: no disponible
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo, su autor o su metodo de compresion.
