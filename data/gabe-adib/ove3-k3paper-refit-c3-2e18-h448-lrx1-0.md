# gabe-adib/ove3-k3paper-refit-c3.2e18-h448-lrx1.0

## Resumen

`ove3-k3paper-refit-c3.2e18-h448-lrx1.0` es un checkpoint de investigación publicado por el usuario `gabe-adib` en HuggingFace. No es un modelo instructivo ni un modelo listo para producto: es el resultado de una ejecución concreta dentro de un barrido de recetas de entrenamiento ("ove3 K3 recipe sweeps"), en la que se reproduce la receta de Kimi K3 tal como fue publicada (variante K3-PAPER) sobre la celda IsoFLOP de 3,2e18 FLOPs de entrenamiento con tamaño oculto 448. El checkpoint corresponde al paso de validación 11.286 de un total de 12.539, con una pérdida de validación de 1,1310 y una pérdida held-out de 1,2258 nats/carácter ponderada por mezcla sobre 9 dominios.

La arquitectura es un transformer decoder-only con mezcla de expertos: MoE de tipo `kimi_linear` con LatentMoE de 512 expertos de media anchura, enrutamiento top-16 con ratio latente 0,5 y sesgo de experto por cuantiles sin pérdida auxiliar. Incorpora Attention Residuals con tamaño de bloque 2, activación SiTU-GLU, compuerta de salida MLA, KDA full-rank con compuerta segura (cota inferior -5), Muon por cabeza con `qk_clip`, RMSNorm con eps 1e-5 y salida de atención MLA en fp32.

Su relevancia es metodológica, no de producto: sirve para estudiar el ajuste de la tasa de aprendizaje a escala IsoFLOP, para reproducir ablaciones de componentes concretos (LatentMoE, Muon, Attention Residuals) y para comparar curvas de pérdida entre recetas. No se han publicado parámetros totales, longitud de contexto, licencia ni idiomas soportados, y el repositorio no incluye benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (`kimi_linear` / LatentMoE): 512 expertos de media anchura, top-16, ratio latente 0,5, sesgo de experto por cuantiles sin pérdida auxiliar; Attention Residuals (bloque 2); MLA con compuerta de salida; KDA full-rank con compuerta segura (-5); SiTU-GLU; RMSNorm eps 1e-5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el enrutamiento es top-16 sobre 512 expertos; el número exacto no se publica) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de 8.192 caracteres por muestra) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint distribuido en precisión de entrenamiento; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelado a nivel de carácter; no se declara cobertura idiomática) |
| Licencia | no disponible |
| Formato de pesos | Megatron-LM distributed checkpoint (`checkpoint/`, incluye estado del optimizador); no hay safetensors ni GGUF |
| Tamaño oculto | 448 |
| Presupuesto de computo | 3,2e18 FLOPs de entrenamiento (celda IsoFLOP de la receta) |
| Tokens de entrenamiento | 13,15B caracteres (12.539 pasos × batch global de 128 × 8.192) |
| Tasa de aprendizaje | 0,00591754 (1,0× la ley de LR de la receta de control en esta celda) |
| Semilla | 1234 |
| Checkpoint publicado | `best_1`, iteración 11.286 |
| Pérdida de validación | 1,1310 |
| Pérdida held-out | 1,2258 nats/carácter (ponderada por mezcla, 9 dominios) |
| Tamaño del repositorio | 3,8 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con mezcla de expertos dispersa. La capa MoE sigue el diseño `kimi_linear` con LatentMoE: 512 expertos de media anchura proyectados a un espacio latente con ratio 0,5, activación de 16 expertos por token y un sesgo de experto ajustado por cuantiles que elimina la pérdida auxiliar de balanceo (aux-loss-free). Sobre el bloque transformer se aplican Attention Residuals con tamaño de bloque 2, atención Multi-head Latent Attention (MLA) con compuerta de salida y salida en fp32, y KDA (`Kimi Delta Attention`) full-rank con compuerta segura de cota inferior -5. La MLP usa SiTU-GLU en lugar de SwiGLU, la normalización es RMSNorm con eps 1e-5 y el escalado del router es 1,0.

El entrenamiento emplea el optimizador Muon por cabeza con `qk_clip` y un schedule coseno con 1% de warmup lineal y decaimiento hasta lr/10. La ejecución usa batch global de 128 secuencias × 8.192 caracteres, semilla 1234 y 12.539 pasos, lo que arroja 13,15B tokens. Los pasos se resolvieron de forma que los FLOPs de entrenamiento igualen los de la celda de control del barrido; la tasa de aprendizaje es exactamente 1,0× la que dicta la ley de LR de la receta de control en esa celda. No se documenta en la información disponible el corpus de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; por la unidad de medida (nats/carácter) y el tamaño de secuencia en caracteres, el modelo parece operar con tokenización a nivel de carácter.

## Capacidades

- Modelado de lenguaje autoregresivo a nivel de carácter: el checkpoint genera texto carácter a carácter, sin tokenizador BPE asociado en la información disponible.
- Razonamiento y conocimiento factual: capacidad limitada y no evaluada; no hay benchmarks publicados de MMLU, GSM8K, HumanEval ni similares.
- Código y matemáticas: no se declara ni se evalúa soporte específico.
- Tool calling / function calling: no soportado; no hay plantilla de chat ni formato de herramientas en el repositorio.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; es un modelo base sin ajuste por instrucciones.
- Multilingüismo: no declarado; al operar sobre caracteres, la cobertura depende enteramente del corpus, que no se documenta.
- Modo "thinking", visión o audio: no disponible.
- Uso como referencia experimental: permite reproducir y auditar una receta completa de entrenamiento (config, logs por segmentos de 4 h, eventos de TensorBoard y puntuaciones por dominio).

## Casos de uso

- Reproducción de la receta K3-PAPER: cargar `config.yaml` y el checkpoint para reanudar o replicar el entrenamiento con semilla 1234 y verificar que la pérdida converge a 1,1310 en validación; útil para auditar la implementación de LatentMoE y de Muon por cabeza.
- Estudios de escalado IsoFLOP: el checkpoint representa una celda concreta (3,2e18 FLOPs, oculto 448) y sirve como punto de medida para ajustar leyes de escalado o comparar la ley de LR de la receta de control frente a la del refit.
- Ablaciones de componentes: al ser una ejecución con SiTU-GLU, Attention Residuals, KDA y MLA output gate activos simultáneamente, permite entrenar variantes apagando uno de esos componentes y comparar curvas de pérdida contra este resultado de referencia.
- Investigación sobre tokenización a nivel de carácter: con 8.192 caracteres por secuencia y pérdida en nats/carácter, es una base para estudiar modelos sin tokenizador en dominios con ortografía irregular o lenguas de bajos recursos.
- Análisis de estabilidad del entrenamiento: los logs por segmentos de 4 h, las puntuaciones por dominio (`DOMAIN_NLL.txt`) y los eventos de TensorBoard permiten estudiar divergencias, picos de gradiente y el efecto de `qk_clip` y de la compuerta segura de KDA.
- Docencia e infraestructura: sirve como caso práctico de despliegue de un checkpoint Megatron distribuido con estado del optimizador, incluyendo la conversión a formatos de inferencia y la inspección de particionados.
- Generación de texto exploratoria: con 13,15B caracteres de entrenamiento, puede producir continuaciones de estilo coherente en dominios vistos, siempre como modelo base sin alineación y sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas reportadas son de pérdida del propio entrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| Pérdida de validación (LM) | 1,1310 | Iteración 11.286 (mejor paso de validación) |
| Pérdida held-out | 1,2258 nats/carácter | Ponderada por mezcla sobre 9 dominios; desglose en `DOMAIN_NLL.txt` |
| MMLU | no disponible | Sin evaluar en la información proporcionada |
| HumanEval | no disponible | Sin evaluar en la información proporcionada |
| GSM8K | no disponible | Sin evaluar en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no calculable de forma fiable porque no se publica el número de parámetros. El repositorio completo ocupa 3,8 GB e incluye estado del optimizador, por lo que los pesos en precisión de entrenamiento son sustancialmente menores que esa cifra.
- GPU recomendadas: no disponibles para entrenamiento o serving a escala; para cargar e inspeccionar el checkpoint basta una GPU consumer con 8 GB o más, dado el tamaño del repositorio.
- Compatibilidad con GPU consumer: probable en inferencia tras convertir el checkpoint, siempre que los pesos finales queden por debajo de la VRAM disponible (8-24 GB en tarjetas tipo RTX 3060, 4070 o 4090). No confirmado por el autor.
- Opciones de despliegue: el formato nativo es Megatron-LM `torch_dist`, por lo que requiere las herramientas de conversión de Megatron (o el cargador de checkpoints de Megatron) antes de usarse con vLLM, TensorRT-LLM, llama.cpp u Ollama. No hay GGUF ni safetensors publicados, así que estos runners no funcionan de forma directa.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens/s ni de tiempo hasta el primer token.
- Nota de entrenamiento: la ejecución se resolvió a 3,2e18 FLOPs, un presupuesto accesible para entrenamiento en un número reducido de GPU, aunque no se especifica el hardware utilizado.

## Comparativa con modelos similares

No se han identificado en la información disponible checkpoints públicos comparables con esta combinación exacta (LatentMoE top-16, KDA, Attention Residuals, Muon por cabeza) y este presupuesto de cómputo. La referencia natural es la propia receta de control del barrido ove3 K3, citada en la model card:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-k3paper-refit-c3.2e18-h448-lrx1.0 | no disponible | no disponible (secuencias de 8.192 caracteres) | Pérdida held-out 1,2258 nats/carácter | no disponible | Checkpoint Megatron en HuggingFace |
| Receta de control ove3 K3 (misma celda IsoFLOP) | no disponible | no disponible | Referencia de la ley de LR (este run usa 1,0×) | no disponible | No publicado como checkpoint en la información disponible |
| Modelos abiertos tipo Kimi K3 | no disponible | no disponible | no disponible | no disponible | No verificable con la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Artefacto de investigación, no producto: es un modelo base sin ajuste por instrucciones, sin plantilla de chat y sin alineación de seguridad; no debe exponerse directamente a usuarios finales.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Métricas limitadas: solo se reporta pérdida (1,1310 en validación, 1,2258 nats/carácter en held-out). No hay evidencia de rendimiento en tareas downstream.
- Escala reducida: 13,15B caracteres de entrenamiento es un presupuesto muy inferior al de modelos de producción, por lo que la calidad factual y la coherencia en generaciones largas serán limitadas.
- Riesgo de alucinación: alto en cualquier uso generativo, agravado por la ausencia de evaluación factual y de fases de preferencia.
- Sesgos: no documentados. Al no publicarse la composición del corpus ni los idiomas, no es posible evaluar sesgos de género, etnia, religión o sesgo lingüístico.
- Cobertura idiomática desconocida: el modelado a nivel de carácter no garantiza un comportamiento correcto en castellano ni en otros idiomas; la pérdida se reporta agregada sobre 9 dominios no especificados en la información disponible.
- Restricciones técnicas de uso: requiere herramientas de Megatron-LM para cargar el checkpoint; no es plug-and-play con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Estado del optimizador incluido: el repositorio pesa 3,8 GB en parte por el estado del optimizador, lo que hay que filtrar antes de publicar pesos de inferencia.
- Reproducibilidad dependiente del entorno: los resultados de pérdida dependen de la implementación exacta de KDA, Muon por cabeza y Attention Residuals; pequeñas diferencias de kernel pueden alterar las curvas.

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-k3paper-refit-c3.2e18-h448-lrx1.0
- Configuración de la ejecución: `config.yaml` dentro del repositorio de HuggingFace
- Desglose de pérdida por dominio: `DOMAIN_NLL.txt` dentro del repositorio de HuggingFace
- Checkpoint distribuido: carpeta `checkpoint/` del repositorio (formato Megatron-LM, incluye estado del optimizador)
- Logs de entrenamiento y TensorBoard: carpeta `logs/` del repositorio
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas sin relación con el contenido); no se dispone de paper, blog, repositorio de código ni demo adicionales.
