# PabloCT-code/VCSD-I

## Resumen

VCSD-I (Modelo de Isla Cósmica) es un repositorio de investigación en cosmología computacional publicado por Pablo Cañete Trinado (usuario PabloCT-code) en HuggingFace. No se trata de un modelo de lenguaje ni de una red neuronal: es un paquete de especificación geométrica, scripts simbólicos en SymPy y simulaciones numéricas en NumPy que implementan una propuesta teórica de gravedad de Einstein-Cartan en 4D, planteada como alternativa geométrica a la materia oscura, la energía oscura y la teoría de cuerdas.

El modelo describe el universo observable como una perturbación geométrica localizada (una "isla cósmica") inmersa en un espaciotiempo de Minkowski estático e infinito. La dinámica se articula en tres pilares: anisotropía elipsoidal tipo Bianchi I con factores de escala diferenciados, un rebote torsional cuántico-geométrico que detiene el colapso primordial en un factor de escala crítico de aproximadamente 1,252838, y un alisamiento métrico tardío que explicaría la aceleración cosmológica y las curvas de rotación galáctica sin componentes oscuros.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y un like, creado en octubre de 2026. Es relevante únicamente como artefacto de investigación teórica reproducible, no como componente de software para producción ni como modelo desplegable. No contiene pesos, tokenizador ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de IA; paquete de simulación numérica y simbólica (NumPy, SymPy, Matplotlib) sobre formalismo de Einstein-Cartan y Bianchi tipo I en 4D |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (documentación en castellano; código en Python) |
| Licencia | MIT para el código (.py); CC-BY-4.0 para el manuscrito (.tex) y material gráfico (.png) |
| Formato de pesos | no disponible (no hay pesos; se distribuyen scripts .py, fuente .tex y una imagen .png) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Implementa un conjunto de auditorías matemáticas y simulaciones numéricas sobre un modelo cosmológico teórico. La estructura modular incluye siete scripts: `01_dinamica_primordial.py` (cálculo iterativo de 300 pasos de H² y densidad con NumPy), `02_auditoria_rebote.py` (resolución simbólica en SymPy de la ecuación de campo en una variedad de Bianchi tipo I con cizalladura controlada σ₀), `03_perfil_curvatura.py` (validación del decaimiento de curvatura y condiciones de unión de Israel en r = R_isla), `04_alisamiento_mecanico.py` (verificación del enderezamiento exponencial hacia Minkowski), `05_optica_redshift.py` (simulación del estiramiento del frente de onda Lyman-alfa con z = 3,3500), `06_vorticidad_filamentos.py` (perfil de velocidad tangencial v_rot ∝ r⁻¹ calibrado con datos de MeerKAT) y `07_grafica_dinamica.py` (generación del gráfico de inversión métrica con Matplotlib).

Los parámetros de calibración base en unidades geometrizadas son: espín inicial s₀ = 0,5; cizalladura inicial σ₀ = 0,1; factor de escala crítico a_c = 1,252838; velocidad del núcleo v_núcleo = 76817,56 en el eje del filamento (r = 1). Cada script incorpora aserciones internas (`assert`) para auditar la consistencia lógica. No hay datos de entrenamiento, dataset, RLHF ni DPO porque no existe un componente de aprendizaje automático.

## Capacidades

- Resolución simbólica de ecuaciones de campo de Einstein-Cartan en variedades de Bianchi tipo I mediante SymPy.
- Simulación numérica de la dinámica primordial (evolución de H² y densidad) en trayectorias iterativas de 300 pasos.
- Verificación analítica de condiciones de unión de Israel en la frontera de la isla cósmica.
- Cálculo de perfiles de curvatura y de alisamiento métrico asintótico hacia Minkowski.
- Simulación de redshift electromagnético (Lyman-alfa) hasta z = 3,3500.
- Ajuste de perfiles cinemáticos de rotación (v_rot ∝ r⁻¹) contra datos astrofísicos de MeerKAT.
- Generación de gráficos científicos de alta resolución de la inversión métrica.
- No dispone de generación de texto, razonamiento, código, matemáticas generales, visión, tool calling, agentes ni capacidades multilingües en el sentido de un modelo de IA.

## Casos de uso

- Reproducción de resultados teóricos en cosmología de Einstein-Cartan: un investigador puede clonar el repositorio, instalar NumPy, SymPy y Matplotlib, y ejecutar los siete scripts para verificar las aserciones internas y reproducir las cifras del manuscrito (a_c ≈ 1,252838, z = 3,3500).
- Docencia de relatividad numérica: los scripts `02_auditoria_rebote.py` y `03_perfil_curvatura.py` sirven como material didáctico para ilustrar la resolución simbólica de ecuaciones de campo y las condiciones de unión en una variedad anisotrópica.
- Validación cruzada de modelos alternativos a la materia oscura: el perfil `v_rot ∝ r⁻¹` de `06_vorticidad_filamentos.py` puede compararse con curvas de rotación observadas de MeerKAT para contrastar la hipótesis del alisamiento métrico tardío.
- Generación de figuras para publicaciones: `07_grafica_dinamica.py` produce el gráfico de inversión métrica listo para incorporar a artículos o presentaciones bajo licencia CC-BY-4.0.
- Auditoría de consistencia matemática: las sentencias `assert` de cada módulo permiten integrar el repositorio en un pipeline de integración continua que detecte regresiones en las derivaciones simbólicas.
- Estudio del rebote torsional primordial: `01_dinamica_primordial.py` permite barrer parámetros (s₀, σ₀) y estudiar cómo varía el punto de anulación de H² y la inversión métrica.
- Análisis de redshift simulado: `05_optica_redshift.py` puede adaptarse para explorar la relación entre el estiramiento del frente de onda y distintos valores de z en un espaciotiempo no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas, y al no ser un modelo de IA no existen evaluaciones tipo MMLU, HumanEval o GSM8K. Los únicos valores numéricos publicados son los parámetros de calibración del propio modelo físico (s₀ = 0,5; σ₀ = 0,1; a_c = 1,252838; v_núcleo = 76817,56; z = 3,3500), que no constituyen benchmarks de rendimiento computacional.

## Requisitos de hardware

- No requiere GPU: los scripts son cálculos NumPy, SymPy y Matplotlib ejecutables en CPU.
- Entorno mínimo: Python 3 con `numpy`, `sympy` y `matplotlib` instalados mediante `pip`.
- Memoria RAM: no se especifica; las simulaciones son de 300 pasos y resolución simbólica, por lo que cualquier equipo convencional es suficiente.
- Almacenamiento: el repositorio ocupa 0,0 GB.
- Opciones de despliegue: ejecución directa por línea de comandos (`python 01_dinamica_primordial.py`, `python 07_grafica_dinamica.py`); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros repositorios de HuggingFace comparables de la misma categoría (cosmología de Einstein-Cartan con auditorías simbólicas). Las alternativas conceptuales del ámbito (por ejemplo, códigos de cosmología numérica como CLASS o CAMB) no se han documentado en esta ficha por falta de datos en la fuente.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no responde a prompts ni puede desplegarse como servicio de inferencia.
- Cero descargas y un único like en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El repositorio tiene 0,0 GB y no incluye pesos ni artefactos binarios; solo scripts y documentación.
- Las afirmaciones físicas del manuscrito (alternativa a materia oscura, energía oscura y teoría de cuerdas) no están contrastadas de forma independiente en la información disponible.
- Los valores de calibración (a_c, z, v_núcleo) proceden del propio autor y no se han verificado con observaciones externas en la fuente consultada.
- La licencia MIT cubre solo los scripts `.py`; el manuscrito `.tex` y el gráfico `.png` están bajo CC-BY-4.0, lo que exige atribución en reutilizaciones.
- Los enlaces DOI del README aparecen como marcadores genéricos (`https://doi.org`, `https://zenodo.org`, `https://shields.io`, `https://opensource.org`, `https://python.org`) y no como URL resueltas, lo que impide verificar la publicación en Zenodo.
- No hay información sobre revisión por pares del manuscrito.
- Uso comercial: permitido por MIT para el código, pero sin garantías de corrección científica; no debe presentarse como software validado para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PabloCT-code/VCSD-I
- DOI declarado en la model card: 10.5281/zenodo.23438356 (no verificable; el README enlaza a `https://doi.org` como marcador genérico)
- Zenodo (referencia genérica en el README, sin URL resuelta): https://zenodo.org
- Licencia MIT: https://opensource.org
- Python: https://python.org
