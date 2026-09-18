# NisargOza/CausalCellJEPA

## Resumen

CausalCellJEPA es un modelo de investigación en PyTorch, publicado por el usuario NisargOza, que predice poblaciones de células únicas perturbadas a partir de una población de control (baseline) y un embedding de acción biológica. No es un modelo de lenguaje ni un `AutoModel` de Transformers: es un modelo de extracción de características y transición de conjuntos, orientado a transcriptómica de célula única y predicción de perturbaciones. Combina un codificador celular JEPA congelado, características de acción derivadas de ESM-2 y una transición de conjuntos condicionada por acción.

La arquitectura se organiza en componentes encadenados: un profesor de etapa 1 que convierte tokens de expresión en estados celulares de 256 dimensiones, un modelo primario de etapa 2 que transforma un conjunto de control de 32 células más una acción de 320 dimensiones en un conjunto predicho, y un módulo de lectura transcriptómica que proyecta el latente de 256 dimensiones a 3.000 genes de alta variabilidad (HVG). Existe además un componente exploratorio (`stage2_multiteacher_v4`) que incorpora dinámicas ESM-2 y ontología génica (GO).

Su relevancia es metodológica más que de estado del arte: el propio autor declara que el estudio terminó con un resultado mixto. La calibración distribucional es buena (MMD y Sinkhorn claramente por delante de la línea base pseudo-emparejada), pero la dirección del efecto en el espacio latente y la transferencia a resultados no vistos siguen siendo limitaciones reconocidas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos no redistribuyen los datos single-cell de Replogle, Adamson y Nadig.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de investigación en PyTorch: codificador celular JEPA congelado + características de acción ESM-2 (320D) + transición de conjuntos condicionada por acción; no es un transformer de lenguaje ni un `AutoModel` de Transformers |
| Parametros totales | no disponible (no se publica el recuento en la model card; el repositorio completo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; la entrada es un conjunto fijo de control `[batch, 32, 256]` y un vector de acción `[batch, 320]` |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors de precisión completa, sin variantes GGUF, AWQ, GPTQ ni cuantizaciones declaradas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no se declara soporte idiomático |
| Licencia | `other`; el repositorio de origen no incluía licencia de software ni de pesos, por lo que la descarga pública no concede por sí misma derechos de reutilización o redistribución |
| Formato de pesos | safetensors (componentes: `stage1_teacher.safetensors`, `stage2_primary.safetensors`, `transcriptomic_readout.safetensors`, `stage2_multiteacher_v4.safetensors`) más `MODEL_MANIFEST.json` y metadatos bajo `provenance/` |

Componentes de pesos publicados:

| Componente | Función | Salida |
|---|---|---|
| `stage1_teacher` | Tokens de expresión a estado celular | 256D |
| `stage2_primary` | Conjunto de control + acción 320D a conjunto predicho | 32 × 256 latentes normalizados |
| `transcriptomic_readout` | Latente 256D a expresión de 3.000 HVG | 32 × 3.000 |
| `stage2_multiteacher_v4` | Exploratorio: dinámicas ESM-2 + GO | no disponible |

Entorno de ejecución fijado por el autor: Python `>=3.11,<3.14` (validado con 3.12.13), PyTorch 2.13.0, NumPy 2.5.2, h5py 3.16.0, safetensors 0.8.0, GeomLoss 0.3.1, PyYAML 6.0.3 y huggingface_hub 1.32.0.

## Arquitectura y entrenamiento

El modelo sigue un diseño por etapas. La etapa 1 (`stage1_teacher`) actúa como codificador JEPA congelado que mapea tokens de expresión a un estado celular de 256 dimensiones. La etapa 2 (`stage2_primary`) implementa una transición de conjuntos condicionada por acción: recibe un conjunto de control de 32 latentes de 256 dimensiones y un vector de acción de 320 dimensiones derivado de características ESM-2, y produce un conjunto de latentes predichos con la misma forma. Un flag booleano `action_known [batch]` permite condicionar la predicción según si la acción es conocida o no, lo que habilita la evaluación de transferencia a dianas nuevas. Finalmente, `transcriptomic_readout` es una proyección lineal (pesos más sesgo, con recorte inferior configurable) que devuelve la expresión en 3.000 genes de alta variabilidad.

La innovación principal es el enfoque de predicción de perturbaciones no emparejadas (unpaired): en lugar de requerir pares control-perturbación célula a célula, el modelo aprende una transición a nivel de población, lo que lo hace compatible con datos reales donde las poblaciones no están emparejadas. El uso de ESM-2 como fuente de características de acción aporta información proteica sobre la perturbación, y el componente exploratorio `stage2_multiteacher_v4` añade dinámicas guiadas por GO. La comparación del estudio usa divergencias distribucionales (MMD, Sinkhorn) además de error de magnitud, lo que refleja un entrenamiento orientado a calibrar la distribución predicha y no solo su media.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (fases propias de modelos de lenguaje que aquí no aplican). Sí se documenta que los datos Replogle, Adamson y Nadig no se redistribuyen y que sus identificadores, particiones, sumas de verificación, roles y auditorías de fuga están en `provenance/`. Los pesos se exportan con Safetensors y `MODEL_MANIFEST.json` registra hashes de origen y de exportación; el checkpoint pequeño de anclaje de efecto se carga con `weights_only=True`.

## Capacidades

- Extracción de características de célula única: codifica expresión génica en latentes de 256 dimensiones mediante el codificador JEPA congelado (`stage1_teacher`). Es la tarea declarada en el pipeline tag (`feature-extraction`).
- Predicción de poblaciones perturbadas no emparejadas: dado un conjunto de control de 32 células y una acción biológica, genera el conjunto predicho de latentes (32 × 256).
- Condicionamiento por acción conocida o desconocida: el flag booleano `action_known` permite distinguir escenarios con acción caracterizada frente a dianas nuevas sin características previas.
- Lectura transcriptómica: proyección del latente a expresión en 3.000 genes de alta variabilidad, con recorte inferior configurable.
- Uso de representaciones proteicas: incorpora características ESM-2 de 320 dimensiones como vector de acción; no genera secuencias ni texto.
- Componente exploratorio con ontología génica: `stage2_multiteacher_v4` añade dinámicas ESM-2 + GO, marcado explícitamente como exploratorio y no confirmatorio.
- No soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades multilingües, de generación de texto, código, matemáticas, visión ni audio. Son funciones fuera del alcance del modelo.

## Casos de uso

- Reproducción de las comparativas publicadas: el repositorio incluye particiones, sumas de verificación y auditorías de fuga en `provenance/`, de modo que un grupo de investigación puede replicar las métricas de MMD, Sinkhorn y error de magnitud frente a la línea base pseudo-emparejada sin acceder a los datos originales redistribuidos.
- Extracción de características para modelos posteriores: los latentes de 256 dimensiones por célula sirven como entrada a clasificadores o modelos de respuesta a fármacos, aprovechando que el codificador JEPA está congelado y es determinista.
- Priorización de dianas en cribados exploratorios: con el flag `action_known` en falso, el modelo estima el efecto de acciones no caracterizadas. Es adecuado únicamente como señal de cribado, ya que el Pearson de efecto latente reportado es bajo (0,0715).
- Aumento de datos para entrenamiento de modelos de perturbación: la predicción de poblaciones calibrada distribucionalmente permite generar conjuntos sintéticos que complementen poblaciones reales escasas, comparables a la línea base pseudo-emparejada del estudio.
- Evaluación de pipelines de calibración distribucional: al reportar MMD y Sinkhorn, el modelo sirve como banco de pruebas para métricas de comparación de distribuciones en transcriptómica, un aspecto donde su rendimiento es sólido (MMD 0,0294).
- Auditoría metodológica de transferencia a dianas nuevas: la comparación en 27 dianas de Adamson, con intervalos de confianza bootstrap por diana, sirve para estudiar cuándo la predicción de perturbaciones generaliza y cuándo falla.
- Estimación del efecto medio de perturbación: dado que supera a la media perturbada en Pearson de Systema con +0,2606 (IC 95 % [+0,1563, +0,3700]) en Adamson, es utilizable para estimar la dirección media de respuesta cuando no se dispone de datos apareados.

## Benchmarks y rendimiento

Replogle double OOD, 199 dianas:

| Métrica | CausalCellJEPA | Pseudo-emparejado |
|---|---:|---:|
| Error absoluto de magnitud (↓) | 0,0591 | 0,2274 |
| MMD (↓) | 0,0294 | 0,0971 |
| Divergencia de Sinkhorn (↓) | 0,1371 | 0,2735 |
| Pearson de efecto latente (↑) | 0,0715 | 0,1873 |

Adamson, 27 dianas:

| Comparación | Diferencia de Pearson de Systema | IC 95 % bootstrap por diana |
|---|---:|---|
| Frente a media perturbada | +0,2606 | [+0,1563, +0,3700] |
| Frente a STRING+GO | −0,0201 | [−0,0422, −0,0002] |

El autor califica el estudio como resultado mixto: la calibración distribucional es fuerte, pero la dirección del efecto latente (donde el pseudo-emparejado obtiene 0,1873 frente a 0,0715) y la transferencia a resultados no vistos siguen siendo limitaciones. La confirmación externa no superó uno de los seis criterios preregistrados, por lo que no se sostiene una afirmación de estado del arte global. No hay resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publican requisitos oficiales. El repositorio completo ocupa 0,1 GB, por lo que los pesos ocupan bastante menos de 1 GB y la inferencia cabe con holgura en cualquier GPU de consumo actual, e incluso en CPU.
- GPU recomendadas: no aplica una recomendación de gama alta (A100, H100); cualquier GPU con unos pocos gigabytes de VRAM disponible es suficiente según el tamaño del repositorio. No hay datos oficiales de compatibilidad específica.
- GPU de consumo: sí cabe en tarjetas de consumo. Dado el tamaño del repositorio, modelos como RTX 3060, RTX 4060 o superiores son más que suficientes; la ejecución en CPU es viable por el reducido tamaño.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue previsto es PyTorch directo mediante `load_components.py`, con verificación de pesos contra `MODEL_MANIFEST.json`, y descarga vía `huggingface_hub` (`snapshot_download`).
- Latencia y throughput estimados: no disponibles.
- Entorno validado: Python 3.12.13, PyTorch 2.13.0, NumPy 2.5.2, h5py 3.16.0, safetensors 0.8.0, GeomLoss 0.3.1, PyYAML 6.0.3, huggingface_hub 1.32.0.

## Comparativa con modelos similares

La model card solo publica comparaciones internas del propio estudio. No se dispone de especificaciones ni resultados de otros modelos de perturbación de célula única en la información proporcionada.

| Referencia | Tipo | Error de magnitud (↓) | MMD (↓) | Sinkhorn (↓) | Pearson latente (↑) |
|---|---|---:|---:|---:|---:|
| CausalCellJEPA | Modelo evaluado | 0,0591 | 0,0294 | 0,1371 | 0,0715 |
| Pseudo-emparejado | Línea base del estudio | 0,2274 | 0,0971 | 0,2735 | 0,1873 |
| STRING+GO | Predictor externo de comparación (solo Adamson) | no disponible | no disponible | no disponible | supera a CausalCellJEPA en Adamson por +0,0201 |
| Otros modelos públicos de célula única | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultado mixto declarado por el autor: no es un estado del arte global validado. La confirmación externa falló uno de los seis criterios preregistrados.
- Dirección del efecto latente débil: Pearson de 0,0715 frente a 0,1873 del pseudo-emparejado en Replogle double OOD (199 dianas). No debe usarse para inferir dirección de efecto con confianza alta.
- Rendimiento inferior a STRING+GO en Adamson: −0,0201 de Pearson de Systema (IC 95 % [−0,0422, −0,0002]), con un intervalo que roza el cero.
- Componentes exploratorios: `stage2_multiteacher_v4` (ESM-2 + GO) es exploratorio post-test y no debe interpretarse como sustituto confirmatorio de la arquitectura primaria.
- Requiere reconstruir características biológicas para dianas nuevas; no generaliza sin ese trabajo previo.
- Sesgos conocidos en los datos de entrenamiento: no documentados en la información disponible más allá de la auditoría de fuga en `provenance/`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es producir predicciones biológicamente plausibles pero incorrectas, especialmente en transferencia a dianas no vistas.
- Limitaciones de contexto e idioma: no aplica ventana de contexto textual ni soporte multilingüe; la forma de entrada es fija (conjunto de 32 células y vector de acción de 320 dimensiones).
- Licencia: el repositorio de origen no incluía licencia de software ni de pesos. La etiqueta `other` en el Hub implica que la descarga pública no concede derechos de reutilización ni de redistribución. Es imprescindible aclarar la licencia con el autor antes de cualquier uso comercial.
- Prohibición de uso clínico: el modelo no está validado para uso clínico, diagnóstico, selección de tratamiento ni aplicaciones críticas de seguridad.
- Datos no redistribuidos: los conjuntos Replogle, Adamson y Nadig no se incluyen; solo se publican identificadores, particiones, sumas de verificación y auditorías.
- Reproducibilidad: el modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NisargOza/CausalCellJEPA
- Repositorio de código y evidencia completa: https://github.com/NisargOza/CausalCellJEPA
- Pesos en el Hub: `weights/stage1_teacher.safetensors`, `weights/stage2_primary.safetensors`, `weights/transcriptomic_readout.safetensors`, `weights/stage2_multiteacher_v4.safetensors`
- Manifiesto de integridad: `MODEL_MANIFEST.json` (hashes de artefactos de origen y de exportación)
- Metadatos de normalización, vocabulario objetivo y procedencia de características: directorio `provenance/`
- Cita: `CITATION.cff` del repositorio de GitHub
- La búsqueda web no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a contenidos no relacionados (repartos de un programa de televisión) y se descartan.
