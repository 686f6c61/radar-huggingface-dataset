# dwqdasdc/symfold

## Resumen

SymFold es un modelo de investigación para la predicción de la estructura secundaria de ARN, desarrollado por el investigador dwqdasdc. El modelo representa la estructura secundaria como una matriz de contacto binaria simétrica (contact map) de dimensiones L×L, donde L es la longitud de la secuencia de ARN de entrada. El proyecto implementa dos rutas de entrenamiento complementarias: una ruta discriminativa directa que produce logits de contacto en una sola pasada hacia adelante, y una ruta generativa basada en discrete flow matching que utiliza muestreo τ-leap CTMC para generar estructuras de forma gradual. El modelo se apoya en encoders de ARN preentrenados como GB.RNA, RNA-FM y RiNALMo, y está diseñado para abordar problemas como la generalización a variantes de secuencia, pares de larga distancia y pares no canónicos. El repositorio en Hugging Face tiene un tamaño de 399,4 GB, lo que sugiere un modelo de gran escala, aunque no se especifican los parámetros totales ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de ARN (GB.RNA, RNA-FM o RiNALMo) + head discriminativa o backbone DiT-style para flow matching |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado (secuencias de ARN de longitud variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (secuencias de ARN) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SymFold utiliza un encoder de ARN preentrenado (GB.RNA, RNA-FM o RiNALMo) para extraer representaciones por nucleotido `[B, L, H]` y mapas de atencion `[B, A, L, L]`. Sobre esta base, el modelo ofrece dos rutas:

1. **Ruta discriminativa directa**: proyecta los hidden states a un espacio de pares (`pair_dim`), fusiona features de secuencia y atencion mediante un gate bidireccional con modulacion FiLM, y aplica un MLP de interaccion con un opcional smoother depthwise 3×3 para modelar consistencia local. Produce logits simetricos de contacto en una sola pasada.

2. **Ruta de discrete flow matching**: construye una representacion de pares que combina `h_i`, `h_j`, `|h_i-h_j|`, `h_i⊙h_j`, atencion del encoder, embedding de distancia logaritmica y opcionalmente tipo de par (AU/GC/GU/other/unknown). Un backbone DiT-style opera en pair space (con patch_size opcional) y predice la probabilidad de contacto condicionada al estado ruidoso `x_t` y al tiempo `t`. El muestreo se realiza mediante τ-leap CTMC.

El entrenamiento usa perdidas masked BCE-with-logits, con opciones de focal reweighting, Dice loss y soft degree penalty (para evitar multiples partners por nucleotido). Los datos incluyen bpRNA (varios splits: spot0, trainfilter, structdedup098, genfilter, full), RNAStrAlign y ArchiveII. Se realizaron experimentos de deduplicacion estructural con bpRNA-align (norm_score >= 0.98) para reducir redundancia en el entrenamiento.

## Capacidades

- Prediccion de estructura secundaria de ARN como contact map simetrico binario.
- Soporte de pseudoknots mediante parsing de bracket tiers (`() [] {} <>` y pares de letras).
- Generacion de estructuras mediante discrete flow matching con muestreo CTMC.
- Analisis de variantes de secuencia y generalizacion a familias de ARN no vistas.
- Integracion con multiples encoders de ARN preentrenados (GB.RNA, RNA-FM, RiNALMo).
- Decodificacion greedy con restriccion at-most-one-partner (no garantiza non-crossing).
- Evaluacion con metricas de Precision, Recall, F1, MCC y Accuracy sobre contact maps.

## Casos de uso

- **Investigacion en biologia estructural de ARN**: prediccion de estructuras secundarias para ARN no codificantes, riboswitches o ARN virales, donde los metodos experimentales son costosos.
- **Analisis de mutaciones y variantes**: evaluacion del impacto de SNPs o ediciones en la estructura secundaria, util en estudios de enfermedades geneticas.
- **Generacion de estructuras candidatas**: la ruta de flow matching permite muestrear multiples estructuras plausibles, util para explorar el espacio conformacional.
- **Benchmarking de metodos de prediccion**: el modelo puede servir como referencia comparativa en pipelines de evaluacion de nuevas herramientas.
- **Integracion en pipelines de anotacion genomica**: anotacion automatica de elementos funcionales basados en estructura (por ejemplo, motivos conservados) en genomas completos.
- **Estudio de interacciones ARN-ARN**: los contact maps pueden extenderse para analizar interacciones intermoleculares, aunque el modelo actual se centra en intramoleculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona experimentos de ablacion y analisis de bad-cases, pero no incluye tablas con metricas cuantitativas (MMLU, HumanEval, etc. no aplican a este dominio). No se proporcionan comparaciones con otros predictores de estructura secundaria como EternaFold o LinearFold.

## Requisitos de hardware

- Tamano del repositorio: 399,4 GB (pesos en safetensors), lo que indica un modelo de gran escala.
- No se especifican requisitos de VRAM para inferencia.
- Probablemente requiere GPUs de alta gama (A100, H100) con al menos 80 GB de VRAM para cargar los pesos completos.
- No se indica si es compatible con GPUs de consumo (RTX 4090, etc.) ni con cuantizacion.
- Opciones de despliegue: no se mencionan frameworks especificos (vLLM, llama.cpp, Ollama, TGI). Dado que es un modelo de investigacion, probablemente se use con PyTorch y transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. Existen otros predictores de estructura secundaria de ARN (como EternaFold, LinearFold, SPOT-RNA), pero no se dispone de datos para una comparacion directa con SymFold.

## Limitaciones y advertencias

- El modelo no garantiza estructuras non-crossing (sin cruces) en la decodificacion greedy, aunque soporta pseudoknots.
- No fuerza pares canonicos (AU, GC, GU), lo que puede generar predicciones biologicamente menos plausibles.
- Riesgo de alucinacion en secuencias poco representadas en el entrenamiento o con estructuras inusuales.
- La licencia no esta especificada, lo que impide determinar si es utilizable en entornos comerciales.
- El modelo esta en fase de investigacion (estado registrado en 2026-08-06) y puede contener cambios no documentados.
- No se proporcionan datos de rendimiento cuantitativo, lo que dificulta evaluar su calidad frente a otros metodos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente y sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/dwqdasdc/symfold
- Repositorio relacionado (ycfywy/symfold): https://github.com/ycfywy/symfold
- Repositorio relacionado (Keshav-Sundar-4/SymFold): https://github.com/Keshav-Sundar-4/SymFold
