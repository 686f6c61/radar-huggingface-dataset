# ArthurMoreau/OffTheGrid

## Resumen

OffTheGrid es un método de reconstrucción 3D basado en *3D Gaussian Splatting* (3DGS) desarrollado por Arthur Moreau y colaboradores. A diferencia de los enfoques convencionales que colocan primitivas gaussianas en una rejilla regular, este modelo detecta las ubicaciones de las gaussianas a nivel de subpíxel, lo que permite generar representaciones 3D más precisas y compactas. El modelo es una red *feed-forward* que, a partir de un conjunto de imágenes sin pose ni calibración, predice directamente un modelo 3D de primitivas gaussianas, logrando una síntesis de nuevas vistas fotorrealista en cuestión de segundos.

La relevancia de OffTheGrid radica en su eficiencia: produce modelos 3D con siete veces menos primitivas que los métodos basados en rejilla, manteniendo o mejorando la calidad visual. Esto reduce los requisitos de memoria y acelera el renderizado, lo que resulta atractivo para aplicaciones en tiempo real, realidad virtual y captura de escenas. El modelo se basa en un gran modelo de reconstrucción existente, que se ajusta finamente con un decodificador basado en detección, una innovación técnica destacable en el campo de la reconstrucción 3D a partir de imágenes.

Aunque el repositorio de HuggingFace no proporciona detalles técnicos completos, el artículo asociado (arXiv:2512.15508) describe el método y sus resultados. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward basada en un gran modelo de reconstrucción (Large Reconstruction Model) con decodificador de detección de primitivas gaussianas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, procesa imágenes) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, pero no se especifica) |

## Arquitectura y entrenamiento

OffTheGrid se presenta como una red neuronal *feed-forward* que predice directamente un modelo 3D de primitivas gaussianas a partir de un conjunto de N imágenes sin pose y sin calibrar de una escena estática. El método se construye sobre un gran modelo de reconstrucción (probablemente un *Large Reconstruction Model*, LRM), que se ajusta finamente para la tarea de predicción de gaussianas 3D mediante un decodificador basado en detección. En lugar de muestrear una rejilla regular de primitivas, el modelo detecta ubicaciones subpíxel para cada gaussiana, lo que permite una asignación más eficiente y precisa de los recursos, capturando detalles finos y reduciendo artefactos.

El entrenamiento se realiza con datos de escenas estáticas, aunque no se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO (que no son aplicables a este tipo de modelo). La innovación principal es el cambio de paradigma de rejilla regular a detección de primitivas, que reduce el número de gaussianas necesarias en un factor de siete, mejorando la eficiencia sin sacrificar calidad.

## Capacidades

- Reconstrucción 3D de escenas estáticas a partir de múltiples imágenes sin pose ni calibración.
- Síntesis de nuevas vistas (novel view synthesis) con resultados fotorrealistas.
- Generación de modelos 3D compactos con aproximadamente siete veces menos primitivas que los métodos basados en rejilla.
- Detección de primitivas gaussianas a nivel de subpíxel, lo que mejora la precisión geométrica.
- Inferencia rápida: genera escenas 3D en segundos.
- No es un modelo de lenguaje, por lo que no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- **Captura de escenas para realidad virtual y aumentada**: OffTheGrid puede reconstruir entornos 3D a partir de fotografías tomadas con cámaras convencionales, permitiendo crear experiencias inmersivas sin necesidad de equipos de escaneo especializados. Su rapidez (segundos) facilita flujos de trabajo en tiempo real.
- **Modelado 3D para videojuegos y animación**: al generar representaciones gaussianas compactas, los desarrolladores pueden integrar objetos y escenas reconstruidas en motores de juego con un coste de memoria reducido, manteniendo un alto nivel de detalle.
- **Arquitectura y construcción**: a partir de un conjunto de imágenes de un edificio o espacio, el modelo puede generar un modelo 3D utilizable para planificación, visualización o documentación, sin necesidad de levantamientos topográficos costosos.
- **E-commerce y catálogos 3D**: permite crear modelos 3D de productos a partir de fotos, mejorando la experiencia de compra online con vistas interactivas.
- **Preservación del patrimonio cultural**: reconstrucción digital de monumentos o artefactos a partir de fotografías históricas o actuales, con alta fidelidad y bajo coste computacional.
- **Robótica y navegación autónoma**: la reconstrucción 3D rápida y precisa de entornos puede emplearse para que robots o vehículos autónomos generen mapas 3D en tiempo real a partir de cámaras, mejorando la percepción del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo menciona que el modelo supera a los competidores en síntesis de nuevas vistas para modelos *feed-forward*, pero no se proporcionan cifras concretas (como PSNR, SSIM o LPIPS) en los materiales revisados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (probablemente requiera GPUs de gama alta, como NVIDIA A100 o RTX 4090, dado que se basa en un gran modelo de reconstrucción, pero no se especifica).
- No se indica si cabe en GPUs de consumo.
- Opciones de despliegue: no disponible (el repositorio no menciona vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de visión, probablemente se use con PyTorch y CUDA).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos. OffTheGrid se enmarca en la categoría de modelos *feed-forward* de 3D Gaussian Splatting, donde existen alternativas como pixelSplat, MVSplat o los Large Reconstruction Models (LRM). La principal diferencia es la detección de primitivas en lugar de rejilla regular, lo que reduce el número de gaussianas. Sin embargo, no se han encontrado tablas comparativas con métricas específicas en la información disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con imágenes de escenas estáticas, puede tener un rendimiento subóptimo en escenas dinámicas o con oclusiones severas.
- Riesgo de alucinación: en reconstrucción 3D, puede generar geometría o texturas inexistentes en regiones no observadas, especialmente con pocas imágenes de entrada.
- Limitaciones de contexto: al no ser un modelo de lenguaje, no aplica el concepto de contexto; sin embargo, el número de imágenes de entrada (N) puede afectar la calidad de la reconstrucción, aunque no se especifica un límite.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, sin obligación de compartir derivados.
- Para producción, se debe validar la calidad en el dominio específico, ya que no se han publicado benchmarks exhaustivos ni requisitos de hardware claros.

## Enlaces

- HuggingFace: https://huggingface.co/ArthurMoreau/OffTheGrid
- Página del proyecto: https://arthurmoreau.github.io/OffTheGrid/
- Artículo arXiv: https://arxiv.org/abs/2512.15508
- PDF del artículo: https://arxiv.org/pdf/2512.15508
- Repositorio GitHub: https://github.com/ArthurMoreau/OffTheGrid
