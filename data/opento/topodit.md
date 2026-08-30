# OpenTO/TopoDiT

## Resumen

TopoDiT es el modelo generativo de Optimize Any Topology 2 (OAT2), desarrollado por el equipo OpenTO. Se trata de un transformer de difusión condicional de 688,6 millones de parámetros, entrenado con flow matching, que genera topologías estructurales de mínima compliance en el espacio latente de un autoencoder de campo neuronal congelado (NFAE). Es el sucesor del U-Net de difusión latente de Optimize Any Topology (NeurIPS 2025) y acepta las mismas entradas: forma del dominio, tamaño de celda de malla, fracción de volumen objetivo, condiciones de contorno y cargas, a cualquier resolución y relación de aspecto.

El modelo resuelve el problema de la optimización topológica estructural, una tarea clásica de diseño de ingeniería que requiere resolver ecuaciones diferenciales parciales y que tradicionalmente se aborda con métodos iterativos costosos. TopoDiT ofrece una alternativa generativa que produce soluciones de alta calidad en un solo paso de inferencia, con una tasa de fallo notablemente inferior a la de su predecesor. Su relevancia actual radica en que combina arquitecturas de difusión modernas con un enfoque de representación latente, permitiendo generalizar a geometrías y resoluciones arbitrarias sin reentrenamiento.

El modelo está disponible bajo licencia MIT, con pesos en formato safetensors, y se integra en el ecosistema PyTorch mediante el mixin `pytorch_model_hub_mixin`. Está pensado para investigadores y desarrolladores en el campo de la ingeniería asistida por IA, diseño generativo y optimización estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) denso con flow matching |
| Parametros totales | 688.552.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de difusion latente, no secuencial) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16/float32, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

TopoDiT emplea un transformer de difusion denso que opera sobre el latente de 64x64x1 del autoencoder NFAE. El latente se divide en parches de tamaño 4, generando 256 tokens. El modelo consta de 24 bloques con ancho 1152 y 16 cabezas de atencion, y predice la velocidad de flow matching. Las condiciones globales (forma del dominio, tamaño de celda y fraccion de volumen) se codifican en un vector que se concatena con el embedding del paso de tiempo y se inyecta mediante modulacion adaLN-Zero. Las condiciones de contorno y las cargas se procesan mediante tokens espaciales con attention pooling sobre una cuadricula de 32 celdas, y se integran en cada bloque mediante cross-attention. Se utilizan embeddings de posicion rectangulares continuos y atencion normalizada QK. El codificador de condiciones tiene 4 capas, ancho 1152, 12 cabezas y ancho de token 768.

El entrenamiento se realizo sobre el conjunto de datos OpenTO, combinando las particiones `labeled` y `NITO`, con un total de 894.000 estructuras optimizadas. Se emplearon 50 epocas, 349.200 pasos con un batch efectivo de 128, optimizador AdamW con tasa de aprendizaje 1e-4 (decaimiento coseno hasta 1e-6, con 1.000 pasos de calentamiento) y weight decay 1e-4. Los timesteps siguen una distribucion logit-normal y se aplica dropout de classifier-free guidance por condicion. Las estadisticas de normalizacion latente se almacenan dentro del propio modelo.

## Capacidades

- Generacion de topologias estructurales de minima compliance a partir de condiciones de contorno y cargas arbitrarias.
- Soporte de resoluciones y relaciones de aspecto variables sin reentrenamiento, gracias a la representacion latente del NFAE.
- Inferencia con muestreo de 20 pasos Euler (recomendado) o incluso 5-10 pasos con resultados equivalentes en escenarios zero-shot.
- Sin necesidad de classifier-free guidance (CFG desactivado con `guidance_scale=1.0`), lo que simplifica el proceso de inferencia.
- Capacidad de generar multiples muestras (best of 4) y refinar con 10 pasos de Projected Gradient Descent (PGD) para reducir aun mas la tasa de fallo.
- Integracion con el pipeline de flujo de OAT2, que incluye el decodificador NFAE y el renderizador para obtener la topologia final.
- Modelo especializado en optimizacion topologica 2D; no soporta tareas de lenguaje, vision general ni tool calling.

## Casos de uso

- Diseno preliminar de componentes estructurales: un ingeniero puede especificar la forma del dominio, las condiciones de contorno y la fraccion de volumen objetivo, y obtener una topologia de minima compliance en segundos, reduciendo el tiempo de iteracion en las fases iniciales de diseno.
- Exploracion de alternativas de diseno: al generar multiples muestras (por ejemplo, best of 4), el modelo permite explorar rapidamente diferentes soluciones topologicas para un mismo problema, facilitando la seleccion de disenos innovadores o no intuitivos.
- Optimizacion topologica en tiempo real: dado que la inferencia requiere solo unos pocos pasos de difusion, el modelo puede integrarse en herramientas interactivas de CAD donde el ingeniero modifica las cargas o restricciones y ve la nueva topologia al instante.
- Validacion cruzada de resultados: los disenos generados por TopoDiT pueden compararse con los obtenidos mediante metodos tradicionales (SIMP, nivel set) para verificar consistencia o detectar errores en los modelos numericos.
- Generacion de datos de entrenamiento: las topologias generadas por el modelo pueden servir como datos aumentados para entrenar otros modelos de aprendizaje automatico en tareas de diseno estructural, o para enriquecer bases de datos de optimizacion.
- Integracion en pipelines de diseno generativo: combinado con el autoencoder NFAE, TopoDiT puede usarse como modulo de generacion en un sistema mas amplio que incluya analisis de elementos finitos, simulacion o manufactura aditiva, permitiendo un flujo de trabajo automatizado de diseno a fabricacion.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto de test de OpenTO (5.000 problemas), evaluados en zero-shot sin classifier-free guidance. La comparacion se realiza contra el modelo OAT (2025), el predecesor de TopoDiT.

| Metrica | OAT (2025) | TopoDiT / OAT2 |
|---|---|---|
| Tasa de fallo, 1 muestra | 40,0% | 21,8% |
| Error de compliance mediano, 1 muestra | 3,94% | 0,46% |
| Tasa de fallo, mejor de 4 | 25,2% | 11,6% |
| Error de compliance mediano, mejor de 4 | 2,86% | 0,18% |
| Tasa de fallo, mejor de 4 + 10 pasos PGD | 14,9% | 5,8% |

Nota: el error de compliance se define como CE = (C − C_gt)/C_gt, donde C_gt es la compliance de la solucion de referencia. Se considera fallo cuando CE ≥ 100%. Las estadisticas y el solucionador FEM son identicos para ambas filas.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para TopoDiT. Sin embargo, con 688 millones de parametros, el modelo en precision bfloat16 ocupa aproximadamente 1,4 GB de VRAM, y el repo completo pesa 2,8 GB.
- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia comoda (por ejemplo, NVIDIA RTX 3060 Ti, RTX 3070, RTX 4060 Ti, o superiores). Para procesar lotes o multiples muestras, se recomienda 12-16 GB.
- GPUs como RTX 3090, RTX 4090, A100 o H100 son adecuadas para entrenamiento o inferencia de alto rendimiento.
- El modelo se despliega mediante el pipeline de flujo de OAT2, que incluye el decodificador NFAE. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La inferencia se realiza con PyTorch y puede ejecutarse en modo de autocasteo bfloat16 para reducir el consumo de memoria y acelerar el calculo.
- No se dispone de datos publicos de latencia o throughput, pero con 20 pasos de Euler y una arquitectura de 256 tokens, la generacion de una topologia deberia completarse en el orden de cientos de milisegundos en una GPU moderna.

## Comparativa con modelos similares

La comparacion mas directa es con su predecesor OAT (Optimize Any Topology), que utiliza un U-Net de difusion latente en lugar de un transformer. Ademas, existen otros enfoques de optimizacion topologica basados en deep learning, aunque no se dispone de datos publicos de rendimiento comparables para todos ellos.

| Modelo | Arquitectura | Parametros | Contexto/Resolucion | Rendimiento (test OpenTO) | Licencia |
|---|---|---|---|---|---|
| TopoDiT (OAT2) | Diffusion Transformer + flow matching | 688,6 M | Cualquier resolucion y relacion de aspecto | Tasa de fallo 21,8% (1 muestra) | MIT |
| OAT (2025) | U-Net de difusion latente | No disponible | Cualquier resolucion y relacion de aspecto | Tasa de fallo 40,0% (1 muestra) | MIT |
| TopoDiT-3D | Diffusion Transformer con atencion topologica | No disponible | Nubes de puntos 3D | No comparable (tarea 3D) | No disponible |

No se han encontrado otros modelos generativos de optimizacion topologica con licencia abierta y resultados publicados en el mismo conjunto de datos, por lo que la comparativa se limita a los modelos de la familia OAT.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el conjunto de datos OpenTO, que cubre un rango especifico de problemas de optimizacion topologica 2D. Puede no generalizar correctamente a geometrias, condiciones de contorno o tipos de carga muy diferentes a los del entrenamiento.
- Aunque la tasa de fallo se ha reducido significativamente respecto a OAT, aun existe un 21,8% de probabilidad de que una sola muestra no cumpla con el criterio de calidad (CE ≥ 100%). Para aplicaciones criticas se recomienda generar multiples muestras y, si es necesario, aplicar pasos de refinamiento PGD.
- El modelo no es un sustituto de un analisis de elementos finitos completo; las topologias generadas deben validarse con un solucionador FEM antes de su uso en produccion.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos sinteticos generados por simulacion, podria heredar sesgos del procedimiento de generacion de datos (por ejemplo, preferencia por ciertos tipos de soluciones).
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende del autoencoder NFAE (tambien de OpenTO) y del repositorio OptimizeAnyTopology2, cuyas condiciones de uso deben verificarse.
- No se proporcionan pesos cuantizados ni soporte para frameworks de inferencia fuera de PyTorch.
- El modelo esta pensado para problemas 2D; para optimizacion 3D existe un trabajo separado (TopoDiT-3D) pero no esta incluido en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/OpenTO/TopoDiT
- Autoencoder NFAE: https://huggingface.co/OpenTO/NFAE
- Paper de Optimize Any Topology (NeurIPS 2025): https://arxiv.org/abs/2510.23667
- Repositorio OptimizeAnyTopology2 (mencionado en la model card, sin URL publica en la informacion disponible)
- Dataset OpenTO: https://huggingface.co/datasets/OpenTO/OpenTO
- Trabajo relacionado TopoDiT-3D: https://github.com/Zechao-Guan/TopoDiT-3D (no es el mismo modelo, pero comparte nombre y enfoque)
