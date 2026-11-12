# mcra-anon-iclr27/mcra-weights

## Resumen

MCRA es un conjunto de pesos adaptadores (adapter) publicado por el usuario anónimo `mcra-anon-iclr27` sobre el modelo proteico `facebook/esm2_t33_650M_UR50D`. No se trata de un modelo de lenguaje ni de un transformer entrenado desde cero, sino de un ajuste fino ligero pensado para extracción de características y predicción de propiedades de proteínas. El repositorio ocupa 7,5 GB e incluye un fichero `adapter.safetensors` que se carga mediante un script propio (`load_adapter.py`) sobre el ESM-2 base.

El modelo resuelve tareas de biología computacional: clasificación de resistencia a antibióticos, predicción de mapas de contacto, estabilidad térmica, señales de sorting celular, interacción proteína-proteína (PPI) y producción de materiales, entre otras. La model card reporta métricas de test para dos particiones temporales (2024 y 2025), lo que sugiere una evaluación con separación temporal para medir generalización.

La relevancia actual radica en que es un adaptador sobre ESM-2, el estándar de facto para embeddings proteicos, y en que publica resultados en múltiples tareas downstream con seeds y particiones explícitas. Sin embargo, la información pública es muy limitada: no hay licencia declarada, no se especifican idiomas (no aplica, al ser proteínas), no hay paper enlazado y el autor es anónimo, probablemente por estar bajo revisión en ICLR 2027 (según el sufijo del nombre).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre ESM-2 (transformer proteico, `facebook/esm2_t33_650M_UR50D`) |
| Parametros totales | No disponible (el base ESM-2 t33 tiene 650M; el adaptador no se cuantifica en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del base ESM-2; tipicamente 1022 residuos en ESM-2) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de proteinas, no de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter.safetensors`) + script `load_adapter.py` |

## Arquitectura y entrenamiento

El modelo base es `facebook/esm2_t33_650M_UR50D`, un transformer de 33 capas y 650M parámetros entrenado por Meta con enmascaramiento de residuos sobre UniRef50. Sobre él se aplica un adaptador cuyos detalles internos (rango, tipo de LoRA, capas afectadas o si es un módulo adicional) no se especifican en la model card. El repositorio incluye un fichero `load_adapter.py` con la función `load_mcra_weights(model, "adapter.safetensors")`, lo que indica que la carga no es estándar de PEFT y requiere ese script.

No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO (poco probable en este dominio). La evaluación se organiza por tarea y por año (2024 y 2025), lo que sugiere particiones temporales de test para medir robustez frente a distribución futura. No se describe ninguna innovación técnica destacable (atención lineal, decodificación especulativa, etc.) más allá del propio adaptador.

## Capacidades

- Extracción de características (embeddings) de secuencias proteicas, heredada de ESM-2.
- Predicción de resistencia a antibióticos (clasificación binaria, `test_acc`).
- Clasificación de cloning (`test_auroc`).
- Predicción de mapas de contacto entre residuos (`test_Top(L/5)`).
- Predicción de solubilidad (tarea `deepsol`, `test_auroc`).
- Predicción de interacción proteína-proteína humana (`human_ppi`, `test_auroc`).
- Predicción de producción de materiales (`material_production`, `test_acc`).
- Predicción de unión a iones metálicos (`metal_ion_binding`, `test_acc`).
- Predicción de señales de sorting celular (`sorting_signal`, `test_f1_max`).
- Predicción de estabilidad térmica (`temperature_stability`, `test_auroc`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo conversacional.

## Casos de uso

- Filtrado temprano de candidatos en ingeniería de proteínas: usar los embeddings del adaptador para puntuar mutantes y priorizar los que probablemente mantengan estabilidad térmica (AUROC reportado de 0,970 en `temperature_stability`), reduciendo el número de variantes a expresar y ensayar en laboratorio.
- Predicción de resistencia a antibióticos en vigilancia genómica: clasificar secuencias de patógenos con `test_acc` de 0,66–0,67 para priorizar cepas que requieran caracterización fenotípica adicional.
- Anotación funcional de metagenomas: aplicar el modelo a proteínas desconocidas para inferir señales de sorting (`test_f1_max` 0,849–0,860) y localización celular, útil en pipelines de anotación a gran escala.
- Detección de interacciones proteína-proteína en estudios de interactoma: usar `human_ppi` (AUROC 0,847) como filtro previo a validación experimental por co-IP o Y2H.
- Predicción de solubilidad en expresión recombinante: emplear la cabeza `deepsol` (AUROC 0,81–0,83) para descartar construcciones con baja probabilidad de expresarse solublemente antes de clonar.
- Modelado de estructura asistido: usar los mapas de contacto predichos (`test_Top(L/5)` 0,843–0,846) como restricciones para plegado o para validar estructuras predichas por AlphaFold.
- Búsqueda de enzimas con unión a metales: clasificar candidatos con `metal_ion_binding` (acc 0,741) en programas de biocatálisis que requieran cofactores metálicos.

## Benchmarks y rendimiento

Resultados reportados en la model card (particiones de test 2024 y 2025):

| Tarea | Metrica | 2024 | 2025 |
|---|---|---|---|
| antibiotic_resistance | test_acc | 0,660767 | 0,666667 |
| cloning_clf | test_auroc | 0,829084 | 0,828298 |
| contact_map | test_Top(L/5) | 0,845719 | 0,842731 |
| deepsol | test_auroc | 0,828123 | 0,810724 |
| human_ppi | test_auroc | 0,847435 | no disponible |
| material_production | test_acc | 0,820180 | no disponible |
| metal_ion_binding | test_acc | 0,740947 | no disponible |
| sorting_signal | test_f1_max | 0,859585 | 0,849511 |
| temperature_stability | test_auroc | 0,970130 | 0,970096 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo base ESM-2 t33 tiene 650M parámetros; en fp32 ocupa aproximadamente 2,6 GB, en fp16 unos 1,3 GB. El repositorio de 7,5 GB incluye el adaptador y probablemente copias de pesos en varios formatos.
- VRAM estimada para inferencia en fp16: ~2–3 GB incluyendo activaciones para secuencias de longitud típica (hasta 1022 residuos). En fp32, ~4–5 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, así como en GPUs de datacenter (A100, H100) para lotes grandes.
- Opciones de despliegue: el script propio `load_adapter.py` sobre PyTorch/Hugging Face Transformers. No hay indicios de soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCRA (este) | Adaptador sobre 650M | No disponible | Multitarea proteica | No disponible | Hugging Face, autor anónimo |
| facebook/esm2_t33_650M_UR50D | 650M | ~1022 residuos | Embeddings generales | MIT (según el modelo base original) | Hugging Face, ampliamente usado |
| facebook/esm2_t36_3B_UR50D | 3B | ~1022 residuos | Embeddings generales | MIT (según el modelo base original) | Hugging Face |
| ProtBert (Rostlab) | 420M | 512 residuos | Embeddings generales | No disponible en la información | Hugging Face |

La comparación con alternativas multitarea específicas (por ejemplo, adaptadores publicados para tareas proteicas concretas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o esperar a la versión definitiva del paper antes de usar en producción.
- Autor anónimo (`mcra-anon-iclr27`): el modelo parece asociado a un envío a ICLR 2027; puede cambiar, retirarse o publicarse con condiciones distintas tras la revisión.
- Sin paper ni documentación técnica: se desconoce el dataset de entrenamiento, el régimen de ajuste y los detalles del adaptador, lo que dificulta la reproducibilidad.
- Métricas limitadas a la propia model card, sin comparación con baselines ni intervalos de confianza.
- `antibiotic_resistance` con acc ~0,66 es modesta; no debe usarse como único criterio clínico.
- Riesgo de sobreajuste a las particiones temporales 2024/2025; la generalización a otras distribuciones (otras especies, otros años) no está validada.
- No es un modelo generativo: no admite prompts en lenguaje natural, tool calling ni agentes. Cualquier uso conversacional es inadecuado.
- No aplica sesgo lingüístico, pero sí posible sesgo hacia las familias proteicas sobrerrepresentadas en UniRef50.
- El repositorio de 7,5 GB incluye pesos redundantes; conviene revisar qué ficheros son necesarios antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/mcra-anon-iclr27/mcra-weights
- Modelo base: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
