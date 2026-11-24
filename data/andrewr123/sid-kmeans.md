# AndrewR123/SID-KMeans

## Resumen

SID-KMeans (Spectral Intrinsic-Dimension Minimum Description Length for K-Means) es un método estadístico para la selección automática del número de clusters K* en K-Means y K-Means++ sobre embeddings neuronales de alta dimensión. Lo desarrolla AndrewR123 y se publica como repositorio de Hugging Face con licencia MIT, acompañado de un artículo técnico completo en PDF y código en Python y C#. No es un modelo de lenguaje ni una red neuronal entrenada: es un algoritmo de clustering con fundamento en teoría de matrices aleatorias e inferencia estadística, empaquetado para su uso con scikit-learn y transformers.

El problema que aborda es concreto: los índices geométricos clásicos (Silhouette, Caliński-Harabasz, Davies-Bouldin), el Gap Statistic y X-Means/BIC fallan al aplicarse a embeddings de 768-4096 dimensiones, típicos de pipelines RAG, descubrimiento de temas o cuantización de caché KV. Estos fallos se manifiestan como colapso por dilución (K* tiende a 1) o inflación por colinealidad (K* tiende a K_max), además de la incapacidad de evaluar K=1 en índices geométricos, lo que produce falsos positivos en corpus de un solo tema.

La propuesta combina tres pilares sin hiperparámetros ajustables: una verosimilitud marginal exacta de mezcla LogSumExp que corrige el sesgo de truncamiento de Voronoi, el umbral de denoising de Gavish-Donoho basado en la ley de Marchenko-Pastur, y el ajuste de grados de libertad de Satterthwaite-Welch para formas cuadráticas en variedades anisótropas. El repositorio incluye validación empírica sobre 60 corpus de 20 Newsgroups con embeddings BGE-Base (768D) y BGE-Large (1024D).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo estadístico de clustering (no red neuronal); combina K-Means con verosimilitud marginal LogSumExp, denoising Marchenko-Pastur (Gavish-Donoho) y ajuste chi-cuadrado de Satterthwaite-Welch |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (documentación y código) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de código; paper en PDF, fuentes LaTeX y Typst, scripts Python y C#) |

## Arquitectura y entrenamiento

SID-KMeans no entrena pesos. Es un estimador de K* construido sobre tres componentes analíticos. El primero es el Teorema 1: demuestra que la partición dura de Voronoi reduce el WCSS sobre una gaussiana unimodal en un factor 1 - 2/(πm), lo que provoca que un BIC basado en WCSS diverja a -2N/π (sobreajuste del 100 %). La solución es evaluar la verosimilitud marginal exacta de la mezcla, que elimina el sesgo de truncamiento de Voronoi y conserva sensibilidad ante clusters que se tocan suavemente.

El segundo componente (Teorema 2, pilar 1) aplica el umbral óptimo de Gavish-Donoho derivado de la ley de Marchenko-Pastur, τ_GD = ω(β)·s_med, para descartar valores singulares por debajo del bulk de ruido isotrópico. Esto previene el colapso por dilución que aparece por encima de d_crit = NΔ²/((K*-1)σ_perp²·ln N). El tercer componente (Teorema 3, pilar 2) ajusta las distancias euclídeas al cuadrado sobre variedades anisótropas a su ley exacta de momentos chi-cuadrado con ν = (Tr Σ̂)²/Tr(Σ̂²), eliminando la inflación por colinealidad de factor d/ν y garantizando invariancia exacta a escala, traslación y rotación ortogonal. Las pruebas simbólicas se verifican con SymPy en python/verify_proofs.py.

El paquete incluye implementaciones en Python (compatible con scikit-learn y transformers) y C# (.NET), además de un simulador. La validación se realizó sobre NVIDIA GB10 (Grace Blackwell) con 60 corpus derivados de 20 Newsgroups y K* en {1, 2, 4, 6, 8, 10}, usando embeddings BGE-Base de 768 dimensiones y BGE-Large de 1024 dimensiones.

## Capacidades

- Selección automática de K* en K-Means y K-Means++ sin hiperparámetros ajustables (λ-free).
- Evaluación correcta de K=1, capacidad que los índices geométricos clásicos no ofrecen.
- Detección de colapso por dilución en espacios de alta dimensión mediante denoising espectral.
- Corrección de la inflación por colinealidad en variedades de baja dimensión intrínseca.
- Invariancia exacta a escala, traslación y rotación ortogonal.
- Integración con scikit-learn y transformers para clustering de embeddings.
- Implementación en Python 3.10+ y en C# .NET con simulador incluido.
- Verificación simbólica de los teoremas mediante SymPy.
- Aplicable a embeddings de 768D a 4096D (RAG, descubrimiento de temas, cuantización de caché KV).

## Casos de uso

- Clustering de chunks en pipelines RAG: agrupar fragmentos de documentos vectorizados con BGE u otros modelos para organizar la recuperación por temas, usando SID-KMeans para fijar K* sin validación cruzada manual sobre corpus de uno o varios temas.
- Descubrimiento de temas en grandes corpus: procesar colecciones tipo 20 Newsgroups o foros técnicos con embeddings de 1024D y obtener el número de temas latentes de forma automática, evitando el colapso a K=2 típico de Caliński-Harabasz.
- Deduplicación semántica de documentos: detectar grupos de documentos casi idénticos en un espacio de embeddings de alta dimensión, aprovechando la capacidad de evaluar K=1 para confirmar cuándo el corpus es homogéneo y no requiere subdivisión.
- Cuantización de caché KV: agrupar representaciones de claves y valores en modelos transformer para reducir memoria, donde la selección robusta de K* en 4096D evita tanto la infra-fragmentación como la sobre-fragmentación.
- Segmentación de clientes sobre embeddings de comportamiento: agrupar perfiles vectorizados de usuarios o sesiones y determinar el número natural de segmentos sin imponer un K predefinido, con invariancia a la escala de las features.
- Auditoría de representaciones: analizar si un modelo de embeddings produce una estructura de clusters real o un continuo unimodal, usando la prevención de sobreajuste nulo (K*=1) como test de estructura latente.
- Investigación en teoría de matrices aleatorias aplicada: reproducir los experimentos de transición de fase en d = 6 a 1536 y validar los teoremas con el script de verificación simbólica incluido.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 60 corpus de 20 Newsgroups con embeddings reales BGE-Base (768D) y BGE-Large (1024D), ejecutados en NVIDIA GB10:

| Metodo | MAE 768D | Acierto ±1 768D | NMI 768D | MAE 1024D | Acierto ±1 1024D | NMI 1024D |
|---|---:|---:|---:|---:|---:|---:|
| SID-KMeans (λ-free) | 0,20 | 100,0 % | 0,745 | 0,23 | 100,0 % | 0,759 |
| X-Means ambiente (Pelleg & Moore) | 0,70 | 93,3 % | 0,707 | 0,53 | 96,7 % | 0,721 |
| Silhouette Score | 0,97 | 73,3 % | 0,715 | 0,80 | 86,7 % | 0,752 |
| Caliński-Harabasz | 3,50 | 33,3 % | 0,435 | 3,50 | 30,0 % | 0,449 |
| Davies-Bouldin | 4,03 | 46,7 % | 0,667 | 4,33 | 40,0 % | 0,673 |
| Gap Statistic (B=10) | 4,77 | 0,0 % | 0,622 | 5,13 | 0,0 % | 0,628 |

## Requisitos de hardware

- No requiere GPU para el algoritmo en sí; la validación empírica del paper se ejecutó en una NVIDIA GB10 (Grace Blackwell) por el volumen de experimentos (60 corpus, dos modelos de embeddings, seis valores de K*).
- Para reproducir los experimentos completos se necesita una GPU capaz de generar embeddings BGE-Base y BGE-Large; una RTX 4090 o superior es suficiente para la inferencia de embeddings a esta escala.
- El cálculo de SID-KMeans sobre los embeddings es CPU-bound (descomposición espectral y evaluación de verosimilitud), por lo que puede ejecutarse en un portátil para corpus de tamaño moderado.
- Despliegue: scripts Python 3.10+ (scikit-learn, transformers, SymPy) y proyecto C# .NET; no hay integración con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; la model card menciona que el Gap Statistic es 5-7 veces más lento que SID-KMeans, pero sin cifras absolutas.

## Comparativa con modelos similares

| Criterio | SID-KMeans | X-Means (Pelleg & Moore) | Gap Statistic (Tibshirani et al.) | Índices geométricos (Silhouette, CH, DB) |
|---|---|---|---|---|
| Tipo | Selección de K* con teoría espectral | Selección de K* con BIC ambiente | Selección de K* con referencia uniforme | Evaluación de particiones |
| Hiperparámetros | Ninguno (λ-free) | Umbral de split y BIC | Número de referencias B | Ninguno relevante |
| Evalúa K=1 | Sí | Parcial | Sí | No |
| MAE en 1024D (BGE-Large) | 0,23 | 0,53 | 5,13 | 0,80-4,33 |
| Invariancia a rotación | Exacta | No garantizada | No | No |
| Licencia | MIT | Implementaciones varias | Implementaciones varias | scikit-learn (BSD) |
| Disponibilidad | Repositorio Hugging Face con paper y código | Bibliotecas de terceros | Bibliotecas de terceros | scikit-learn |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- La validación empírica se limita a 20 Newsgroups con embeddings BGE-Base y BGE-Large; no se han publicado resultados sobre otros dominios (código, multilingüe, biomedicina) ni sobre embeddings de 4096D reales, aunque el método se presenta como aplicable hasta esa dimensión.
- Los teoremas asumen un modelo gaussiano de mezcla con ruido isotrópico; desviaciones fuertes de ese supuesto (distribuciones multimodales complejas, ruido heterocedástico) pueden degradar la selección de K*.
- El idioma de la documentación es únicamente inglés.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte.
- El paper está fechado en 2026 y el repositorio se creó el 24 de noviembre de 2026; conviene verificar la vigencia del código y de las dependencias (PyTorch, scikit-learn, transformers) antes de integrarlo en producción.
- No es un sustituto de un modelo de embeddings: requiere un modelo externo (BGE u otro) para generar las representaciones de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AndrewR123/SID-KMeans
- Paper completo (PDF): https://huggingface.co/AndrewR123/SID-KMeans/blob/main/paper/SID_KMeans_Paper.pdf
- Fuente LaTeX del paper: https://huggingface.co/AndrewR123/SID-KMeans/blob/main/paper/main.tex
- Fuente Typst del paper: https://huggingface.co/AndrewR123/SID-KMeans/blob/main/paper/main.typ
- Verificación simbólica de los teoremas: https://huggingface.co/AndrewR123/SID-KMeans/blob/main/python/verify_proofs.py
- Implementación C#/.NET: https://huggingface.co/AndrewR123/SID-KMeans/tree/main/csharp
- Licencia MIT: https://huggingface.co/AndrewR123/SID-KMeans/blob/main/LICENSE
