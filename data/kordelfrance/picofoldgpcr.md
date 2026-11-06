# kordelfrance/picofoldGPCR

## Resumen

PicofoldGPCR es un generador de geometría de receptores acoplados a proteína G (GPCR) condicionado por molécula, desarrollado por el usuario kordelfrance. Se trata de un modelo de difusión condicional de tamaño muy reducido (367.000 parámetros) que, a partir de las características de una molécula ligando, genera un vector latente de 42 valores que describen la posición y orientación de las siete hélices transmembrana de un receptor de referencia. Ese vector deforma una traza de esqueleto C-alfa fija de 302 residuos (OR51E2, PDB 8F76, cadena A) para producir una visualización de la estructura plegada.

El modelo no predice secuencia de aminoácidos ni estructura atómica completa: su tarea es un problema didáctico y de visualización, pensado para ser inspeccionable, explicable y exportable a aplicaciones móviles (Scentience para iOS y Android). La restricción de despliegue en hardware de borde condicionó la arquitectura hacia operaciones y capas simples, lo que explica su tamaño mínimo y su enfoque en un espacio latente de baja dimensión.

Es relevante ahora como ejemplo de modelado generativo de proteínas de bajo coste computacional: demuestra que un denoiser de difusión de menos de 400.000 parámetros puede aprender a recuperar poses de hélices condicionadas por ligando, con un pipeline de entrenamiento de aproximadamente 200 líneas de código PyTorch. No obstante, su alcance es educativo y de visualización, no de predicción estructural de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión condicional (MLP) sobre espacio latente de 42 dimensiones; sin transformer |
| Parámetros totales | 367.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 42 valores latentes + 265 features de molécula + 16 features de tiempo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

PicofoldGPCR es un modelo de difusión condicional que opera sobre un espacio latente de 42 dimensiones: siete hélices, cada una con tres valores de traslación y tres de rotación en eje-ángulo. El denoiser recibe el latente ruidoso $z_t$, un vector de 265 características de la molécula y 16 características sinusoidales de tiempo $\phi(t)$, y predice el latente limpio $\hat{z}_0$ mediante una pérdida MSE. El entrenamiento usa un schedule coseno de 200 niveles, lotes de 64, AdamW con learning rate 0.001, weight decay 0.0001 y recorte de gradiente en 1. En el 20% de los ejemplos se anulan las features de molécula para que el modelo aprenda también sin condicionamiento. La generación emplea una media móvil exponencial de los pesos (decay 0.99) y 40 pasos DDIM por defecto, con recorte del latente predicho al rango soportado en cada paso.

La innovación principal no es algorítmica sino de escala y propósito: mantener el modelo lo bastante pequeño para inspeccionarlo y exportarlo a móvil, con una representación de estructura reducida (hélices internamente rígidas, bucles con desplazamientos interpolados desde la geometría de referencia). El modelo se entrenó sobre dos variantes de datos: poses artificiales sintéticas (opción A) y poses proyectadas desde fotogramas de dinámica molecular publicados (opción B). La traza de referencia procede de la estructura experimental OR51E2 con propionato unido.

## Capacidades

- Generación de geometría de esqueleto C-alfa de GPCR condicionada por características de molécula ligando.
- Modelado generativo por difusión con muestreo DDIM (40 pasos por defecto, configurable mediante `--eta`).
- Condicionamiento opcional: puede generar sin features de molécula (entrenado con dropout de condicionamiento del 20%).
- Producción de un vector latente interpretable de 42 valores (6 por hélice: 3 traslación + 3 rotación eje-ángulo).
- Visualización de la estructura plegada junto a la curva de pérdida de entrenamiento.
- Exportabilidad a aplicaciones móviles iOS y Android (restricción de diseño que limita operaciones y capas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Visualización educativa de plegamiento de GPCR: el modelo permite generar y animar un esqueleto C-alfa a partir de ruido en 200 pasos de denoising, útil para explicar el proceso de difusión en clase o en materiales divulgativos.
- Exploración de la relación ligando-geometría en receptores olfativos: dado un vector de 265 características de molécula, se puede observar cómo cambia la pose de las siete hélices, como aproximación cualitativa al reconocimiento de odorantes.
- Prototipado de apps móviles de biología estructural: al ser exportable a iOS y Android, sirve como componente de demostración en aplicaciones de divulgación científica que necesiten generar visualizaciones 3D ligeras en el dispositivo.
- Docencia de métodos generativos: el código de entrenamiento y muestreo cabe en unas 200 líneas, lo que lo convierte en un ejemplo práctico para enseñar difusión condicional, schedules coseno y muestreo DDIM con datos reales de proteínas.
- Prueba de concepto de arquitecturas de borde: sirve para evaluar si un denoiser MLP de 367.000 parámetros es suficiente para una tarea geométrica concreta antes de invertir en modelos mayores.
- Generación de poses sintéticas para data augmentation: las poses artificiales de la opción A pueden usarse como datos aumentados en pipelines de análisis conformacional de hélices transmembrana.
- Comparación de estrategias de datos: permite contrastar poses artificiales frente a poses proyectadas de dinámica molecular en una misma tarea de generación, como experimento controlado de metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad estructural (RMSD, TM-score, etc.) ni comparaciones numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 367.000 parámetros y el repositorio ocupa 0,4 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM; RTX 4090, A100 o H100 son innecesarias para este modelo, que está diseñado para hardware de borde.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en hardware móvil (objetivo de diseño del autor).
- Opciones de despliegue: PyTorch nativo; exportación a formatos móviles para iOS y Android (el autor menciona exportabilidad a las apps Scentience). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el muestreo por defecto usa 40 pasos DDIM sobre un MLP diminuto, lo que sugiere latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PicofoldGPCR | 367.000 | Latente de 42 dims + 265 features de molécula | Generación de poses de hélices GPCR | no disponible | Hugging Face (kordelfrance/picofoldGPCR) |
| picofold (Dave Burke) | no disponible | no disponible | Plegamiento de proteínas educativo | no disponible | GitHub (daveyburke/picofold) |
| AlphaFold2 | ~93.000.000 | Secuencia de aminoácidos | Predicción de estructura atómica completa | no disponible en esta ficha | Código y pesos públicos |

La comparación con AlphaFold2 es solo orientativa de categoría: PicofoldGPCR no predice estructura atómica ni secuencia, sino poses de hélices sobre una traza fija. No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No predice secuencia de aminoácidos ni estructura atómica completa: solo genera 42 valores de pose sobre una traza C-alfa de referencia fija (OR51E2, PDB 8F76).
- Las hélices se mantienen internamente rígidas y los bucles se interpolan desde la geometría de referencia, lo que limita la variabilidad conformacional realista.
- El modelo está condicionado a un único scaffold de receptor; no generaliza a otras proteínas ni a otras familias de GPCR sin reentrenamiento.
- Es un proyecto educativo y de visualización; no debe usarse para predicción estructural de precisión ni para aplicaciones farmacológicas.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de robustez; al no ser un modelo de lenguaje, estos riesgos se manifiestan como geometrías no físicas o poses fuera del rango soportado (mitigado parcialmente por el recorte del latente en el muestreo).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-04) es futura respecto a la información habitual de Hugging Face; conviene verificar la ficha original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kordelfrance/picofoldGPCR
- Repositorio de referencia picofold (Dave Burke): https://github.com/daveyburke/picofold
- Paper DDIM (arxiv:2010.02502): https://arxiv.org/abs/2010.02502
- Estudio OR51E2 de referencia (Nature): https://doi.org/10.1038/s41586-023-05798-y
- Estructura PDB 8F76: https://www.rcsb.org/structure/8F76
