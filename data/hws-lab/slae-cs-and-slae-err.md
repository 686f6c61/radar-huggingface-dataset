# hws-lab/SLAE-CS-and-SLAE-ERR

## Resumen

SLAE-CS y SLAE-ERR son dos modelos complementarios desarrollados por el laboratorio Wayment-Steele (hws-lab) para predecir el desplazamiento químico del nitrógeno amida (¹⁵N) de cada residuo del esqueleto proteico a partir de su estructura tridimensional, así como para estimar el error absoluto de dicha predicción. Ambos se construyen sobre el codificador de estructura al-atom SLAE (Chen et al., ICML 2026) y se publican como repositorio companion del artículo "Learning the limits of protein structure models with NMR chemical shifts" (bioRxiv, 2026).

El modelo SLAE-CS se distribuye como un ensemble de 10 semillas entrenadas sobre el conjunto rBMRB-PANAV; la predicción final es la media de las 10 salidas, lo que reduce el RMSE de 1,811–1,838 ppm (semillas individuales) a 1,745 ppm. SLAE-ERR es un único modelo que predice, residuo a residuo, el error absoluto esperado del ensemble SLAE-CS, con un MAE de 0,760 ppm frente al error real. Ambos modelos son extremadamente ligeros: 14,5 M parámetros y 58 MB por checkpoint, lo que permite inferencia en CPU o en GPU de consumo.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un modelo científico especializado en biología estructural que combina NMR y predicción de estructura. Su utilidad práctica está en el control de calidad de modelos de estructura proteica (AlphaFold2, predicciones experimentales) mediante una señal experimental independiente como son los desplazamientos químicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SLAE (all-atom structure encoder) con cabecera de regresión por residuo; fine-tuned desde `autoencoder.ckpt` de SLAE |
| Parametros totales | 14,5 M por checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: una proteína por fichero PDB, cadena única) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no aplica; modelo científico no lingüístico) |
| Licencia | Apache 2.0 (incluye copia fine-tuned del codificador SLAE, también Apache 2.0) |
| Formato de pesos | `model.safetensors` (58 MB por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

SLAE-CS y SLAE-ERR se construyen sobre el codificador de estructura al-atom SLAE, publicado por Chen et al. (ICML 2026) y disponible en el repositorio ProteinDesignLab/SLAE. El codificador se inicializa desde el checkpoint público `autoencoder.ckpt` y se fine-tunea para la tarea de regresión del desplazamiento químico ¹⁵N del esqueleto. SLAE-CS-PANAV se entrena con 10 semillas independientes sobre el conjunto rBMRB-PANAV; para cada semilla se conserva el checkpoint con menor RMSE de validación en ¹⁵N. SLAE-ERR se entrena sobre rBMRB-ERROR, formado por predicciones out-of-fold del ensemble para el conjunto de entrenamiento, y recibe como entrada la estructura junto con la desviación estándar de las 10 predicciones y las 10 predicciones ordenadas y centradas en su media.

Los datos de entrenamiento provienen de rBMRB (CC-BY-4.0), derivado del Biological Magnetic Resonance Data Bank (BMRB), restringido a proteínas de entidad única (sin parejas de unión, ligandos ni iones metálicos) medidas a pH 4,5–8,5 y 293–313 K. Las estructuras de entrada empleadas en el entrenamiento fueron modelos AlphaFold2. El conjunto de test de rBMRB-PANAV contiene 407 proteínas y 42.153 residuos; las métricas se calculan solo en residuos donde coinciden la máscara experimental y la máscara de predicción (flags PANAV + etiquetas de tag), excluyendo prolinas.

## Capacidades

- Predicción del desplazamiento químico ¹⁵N del esqueleto amida por residuo a partir de una estructura PDB de cadena única.
- Ensemble de 10 semillas con media (`N_mean`) y desviación estándar (`N_std`) por residuo, lo que proporciona una medida de incertidumbre del ensemble.
- Estimación del error absoluto esperado de la predicción del ensemble por residuo (`N_abs_error`), útil para filtrar residuos poco fiables.
- Procesamiento por lotes de directorios completos de ficheros PDB (`--pdb structures/`).
- Ejecución en CPU o GPU (`--device auto|cuda|cpu`), con inferencia a batch size 1.
- Salidas en CSV (una fila por residuo) y JSON (predicciones por semilla, máscara, media y desviación).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo científico de regresión estructural.

## Casos de uso

- Control de calidad de modelos de estructura proteica: comparar los desplazamientos ¹⁵N predichos por SLAE-CS sobre una estructura AlphaFold2 con los experimentales de RMN permite detectar regiones donde el modelo de estructura no representa el estado conformacional medido; SLAE-ERR ayuda a priorizar residuos con error esperado alto.
- Validación de modelos experimentales de RMN: dado un ensemble de RMN, dividir los modelos (`split_nmr_models.py`) y ejecutar SLAE-CS sobre cada uno para comparar la coherencia estructural con los desplazamientos medidos.
- Anotación de estructuras en pipelines de biología estructural: generar ficheros CSV/JSON con desplazamientos ¹⁵N esperados por residuo para enriquecer bases de datos o metadatos de estructuras depositadas.
- Filtrado de residuos fiables en estudios de asignación: usar `N_abs_error` para descartar residuos con error esperado alto antes de comparaciones cuantitativas o de integración con datos de RMN.
- Investigación en plegamiento y dinámica: analizar la desviación entre semillas (`N_std`) como proxy de ambigüedad estructural en regiones concretas de la proteína.
- Docencia y formación en biología estructural computacional: el notebook de Colab permite ejecutar el test y una predicción completa en una GPU de Colab, lo que facilita reproducir el flujo sin infraestructura propia.
- Benchmarking de nuevos predictores de estructura: usar SLAE-CS como referencia externa e independiente (basada en RMN) para evaluar la calidad de modelos generados por métodos de plegamiento.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test rBMRB-PANAV (407 proteínas, 42.153 residuos), recalculada con los pesos del repositorio:

| Modelo | Métrica | Valor |
|---|---|---|
| SLAE-CS-PANAV, semillas individuales | RMSE ¹⁵N (ppm) | 1,811 – 1,838 |
| SLAE-CS-PANAV, media de 10 semillas | RMSE ¹⁵N (ppm) | 1,745 |
| SLAE-ERR | MAE por residuo entre error absoluto predicho y real (ppm) | 0,760 |

No se han publicado en la información disponible resultados comparativos con otros predictores de desplazamientos químicos (por ejemplo, SPARTA+, UCBShift, CamShift) ni métricas adicionales como correlación de Pearson o R².

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 14,5 M parámetros y 58 MB por checkpoint, el ensemble de 10 semillas ocupa del orden de 580 MB de pesos, más activaciones mínimas (batch size 1). Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: el repositorio oficial proporciona `predict.py` (PyTorch) y un contenedor en `containers/slae/`; también hay un notebook de Google Colab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; la inferencia se ejecuta a batch size 1 y requiere ejecutar 10 semillas para el ensemble completo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de predictores alternativos de desplazamientos químicos ¹⁵N (SPARTA+, UCBShift, CamShift, etc.) ni de sus parámetros o licencias, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | RMSE ¹⁵N | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLAE-CS-PANAV (ensemble) | 14,5 M × 10 semillas | no aplica (PDB de cadena única) | 1,745 ppm | Apache 2.0 | Hugging Face + GitHub |
| SLAE-ERR | 14,5 M | no aplica | MAE 0,760 ppm (error) | Apache 2.0 | Hugging Face + GitHub |
| Alternativas (SPARTA+, UCBShift, CamShift) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los modelos se entrenaron con proteínas de entidad única del BMRB, sin parejas de unión, ligandos ni iones metálicos, y con medidas a pH 4,5–8,5 y 293–313 K. Las predicciones fuera de ese rango son extrapolaciones.
- Las estructuras de entrada en entrenamiento fueron modelos AlphaFold2; los resultados con estructuras experimentales u otras predicciones pueden diferir, y una estructura que no represente el estado conformacional medido produce errores grandes.
- Solo se predice el desplazamiento ¹⁵N del esqueleto amida; las prolinas quedan excluidas por no tener amida.
- Solo se procesa el primer modelo de un fichero PDB multi-modelo; para ensembles de RMN hay que dividirlos previamente con `split_nmr_models.py`.
- SLAE-ERR requiere obligatoriamente las 10 semillas de SLAE-CS-PANAV; no funciona con un subconjunto.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones erróneas en regiones estructuralmente ambiguas o fuera de la distribución de entrenamiento; se recomienda usar `N_abs_error` y `N_std` como filtros.
- Sesgos conocidos: no documentados explícitamente en la información disponible; la distribución del BMRB puede sobrerrepresentar ciertas familias proteicas.
- Licencia Apache 2.0 permite uso comercial; los datos de entrenamiento rBMRB son CC-BY-4.0, por lo que se debe atribuir su uso.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; es un artefacto de investigación reciente sin validación independiente amplia.

## Enlaces

- Hugging Face: https://huggingface.co/hws-lab/SLAE-CS-and-SLAE-ERR
- Código: https://github.com/WaymentSteeleLab/SLAE-CS-and-SLAE-ERR
- Dataset rBMRB: https://huggingface.co/datasets/hws-lab/rBMRB
- Paper (bioRxiv, 2026): https://doi.org/10.64898/2026.11.12.766294
- Codificador SLAE original: https://github.com/ProteinDesignLab/SLAE
