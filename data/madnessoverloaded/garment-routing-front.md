# MadnessOverloaded/garment-routing-front

## Resumen

`garment-routing-front` es un clasificador de imágenes basado en ConvNeXt-Tiny, publicado por el usuario MadnessOverloaded como parte del proyecto de portafolio "Second-Life Garment Routing" de Madhusudan Pareek. El modelo aborda una tarea concreta: apoyar la decisión de enrutamiento de prendas de segunda mano en plantas de clasificación, prediciendo la clase de uso (macro-F1 de 4 clases) y una estimación de condición a partir de una única fotografía frontal de la prenda.

El modelo no es un modelo generativo ni un LLM: es un clasificador de visión por computador entrenado sobre el "Clothing Dataset for Second-Hand Fashion v3" (Zenodo, CC-BY 4.0), con etiquetas expertas de Wargön Innovation y Myrorna. Los pesos se distribuyen en float16 junto con la temperatura de calibración (1.670) y un umbral de abstención (0.422) ajustados sobre validación.

Su relevancia es acotada: se trata de una demostración de investigación y portafolio, no de un sistema listo para producción. El propio autor advierte que una persona debe seguir siendo responsable de la prenda y que el modelo no sirve para clasificación desatendida, evidencia EPR, identificación de fibras ni autenticación de marcas. Los resultados publicados son modestos y reflejan la dificultad intrínseca de la tarea, con un acuerdo entre expertos también bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN, fusión de vista frontal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | pesos en float16; inferencia en float32 en la demo de CPU |
| Idiomas soportados | no disponible (modelo de imagen; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | `model.fp16.pt` (state dict de PyTorch, float16) + `router.yaml` |
| Entrada | imagen frontal de la prenda |
| Salidas | clase de uso (4 clases) y estimación de condición |
| Calibración | temperatura 1.670, umbral de abstención 0.422 |
| Tamaño del repo | 0.1 GB |
| Librería | pytorch |

## Arquitectura y entrenamiento

El modelo emplea ConvNeXt-Tiny, una red convolucional moderna con bloques tipo transformer, adaptada para una fusión de vista frontal (front-view fusion). Se distribuye como state dict de PyTorch en float16, sin optimizador, e incluye la temperatura de calibración y el umbral de abstención ajustados sobre el conjunto de validación.

El entrenamiento utiliza exclusivamente las estaciones 1 y 2 del "Clothing Dataset for Second-Hand Fashion v3" (Zenodo, DOI 10.5281/zenodo.13788681, CC-BY 4.0), con etiquetas expertas de Wargön Innovation. La estación 3 (Myrorna) y el conjunto gold nunca entran en entrenamiento ni en el ajuste de temperatura o umbral, lo que permite evaluar la generalización a un sitio no visto. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Clasificación de imágenes de prendas en 4 clases de uso (macro-F1 de 4 clases).
- Estimación de condición de la prenda (MAE y precisión dentro de ±1).
- Calibración de confianza mediante temperatura ajustada (ECE de 0.047 en test).
- Mecanismo de abstención basado en umbral (0.422) para rechazar predicciones de baja confianza.
- Enrutamiento ilustrativo mediante `router.yaml` (pesos de ejemplo, no LCA ni capacidad real de socios).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.

## Casos de uso

- Apoyo a la decisión en plantas de clasificación de segunda mano: el modelo predice la clase de uso y la condición a partir de una foto frontal, sirviendo como segunda opinión para el operario, que mantiene la responsabilidad final.
- Investigación académica sobre enrutamiento de prendas: permite reproducir y comparar métricas (macro-F1, balanced accuracy, MAE de condición, ECE) sobre el dataset de Zenodo con estaciones separadas para validación externa.
- Demostración de portafolio: ilustra un pipeline completo de visión por computador con calibración, abstención y evaluación por sitios, útil como ejemplo docente.
- Evaluación de calibración y abstención: el par temperatura/umbral permite estudiar el compromiso entre cobertura y precisión en un dominio con alto desacuerdo entre expertos.
- Prototipado de sistemas de clasificación textil con separación train/test por sitio: la partición estaciones 1-2 frente a estación 3 sirve como plantilla para validar generalización geográfica.
- Análisis de desacuerdo entre anotadores: los valores de kappa experto-experto (0.193 en uso, 0.308 en condición cuadrática) permiten contextualizar el techo realista de la tarea antes de invertir en modelos más grandes.

## Benchmarks y rendimiento

| Split | Uso macro-F1 (4 clases) | Balanced accuracy | MAE condición | Condición dentro de ±1 | ECE tras T |
|---|---|---|---|---|---|
| test | 0.343 (IC 95% 0.294–0.403) | 0.378 | 0.995 | 0.741 | 0.047 |
| estación 3 | 0.188 | 0.356 | 1.010 | 0.753 | 0.075 |

Referencias del autor: techo de atributos con LightGBM en test (6 clases expertas) de 0.405; macro-F1 de la clase mayoritaria en test (4 clases) de 0.164.

Kappa de Cohen en el conjunto gold (IC bootstrap 95% a nivel de prenda):

| Comparación | Uso | Condición (cuadrática) |
|---|---|---|
| Experto vs. experto | 0.193 (0.119–0.271) | 0.308 (0.202–0.410) |
| Modelo vs. Wargön (foto Wargön) | 0.079 (0.017–0.152) | no disponible |
| Modelo vs. Myrorna (misma foto Wargön) | 0.113 (0.056–0.185) | no disponible |

## Requisitos de hardware

- VRAM estimada: ConvNeXt-Tiny en float16 requiere del orden de 0.1-0.3 GB para pesos; con activaciones de inferencia por lotes pequeños, menos de 2 GB en total. No se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobradas para inferencia. El modelo cabe holgadamente en GPU de consumo.
- CPU: la demo oficial carga los pesos en float16 y ejecuta inferencia en float32, por lo que funciona en CPU sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo (state dict `model.fp16.pt`); no se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| garment-routing-front | ConvNeXt-Tiny | Clasificación de uso y condición de prendas | Imagen frontal | MIT | Hugging Face |
| LightGBM (techo de atributos del autor) | Árboles gradient boosting | Clasificación de atributos (6 clases expertas) | Atributos tabulares | no disponible | Referencia interna del proyecto |
| Clasificador de clase mayoritaria (baseline) | Regla trivial | Clasificación de uso (4 clases) | Imagen | no aplica | Baseline del proyecto |

No se dispone de comparaciones con otros modelos públicos de enrutamiento de prendas de segunda mano en la información proporcionada.

## Limitaciones y advertencias

- Los pesos del router en `configs/router.yaml` son marcadores ilustrativos, no reflejan LCA ni capacidad real de los socios.
- Las clases Repair, Remake y Energy recovery colapsan en la clase de entrenamiento Other.
- El desacuerdo entre expertos es elevado; el kappa del modelo debe leerse junto al kappa experto-experto (0.193 en uso, 0.308 en condición).
- La estación 3 verifica un segundo sitio sueco, no otro país, por lo que la generalización geográfica no está demostrada.
- El modelo no sirve para clasificación desatendida, evidencia EPR, identificación de fibras a partir de fotos ni autenticación de marcas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de predicciones erróneas con confianza calibrada; el umbral de abstención (0.422) mitiga parcialmente este riesgo.
- Las fotos gold de Myrorna faltan en el archivo, por lo que sus anotaciones se puntúan con la foto de Wargön de la misma prenda, lo que puede introducir sesgo en las métricas.
- Licencia MIT permite uso comercial, pero el autor restringe explícitamente el uso previsto a investigación y demostración de portafolio; conviene respetar esa intención.
- El dataset subyacente es CC-BY 4.0, lo que exige atribución a Farrukh Nauman, RISE, Wargön Innovation AB, Myrorna AB y Vinnova / EU CISUTAC.
- No se documentan sesgos demográficos ni de composición del dataset más allá de la separación por estaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MadnessOverloaded/garment-routing-front
- Dataset en Zenodo: https://doi.org/10.5281/zenodo.13788681
- Repositorio del proyecto: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo (Space): no disponible en la información proporcionada
