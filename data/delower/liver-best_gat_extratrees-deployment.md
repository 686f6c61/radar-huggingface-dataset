# Delower/liver-best_gat_extratrees-deployment

## Resumen

El repositorio `Delower/liver-best_gat_extratrees-deployment` no contiene un modelo de lenguaje ni una red neuronal generativa, sino un artefacto de despliegue para un clasificador de toxicidad hepática (DILI, *Drug-Induced Liver Injury*) construido a partir de la combinación de dos modelos de quimioinformática: un `ExtraTreesClassifier` sobre descriptores moleculares y una red de atención sobre grafos (GAT) sobre grafos moleculares. Lo desarrolla el usuario Delower en el marco de un programa interno de toxicidad de órganos, y su función es predecir la probabilidad de que un compuesto (expresado como SMILES) presente riesgo hepático.

El artefacto empaqueta dos *refits* de despliegue entrenados sobre la totalidad del conjunto etiquetado del programa (1.891 compuestos únicos), con los compuestos del benchmark regulatorio absorbidos únicamente en la partición de entrenamiento. La mezcla final no se reentrena: aplica pesos fijos de 0,55 para ExtraTrees y 0,45 para GAT, con umbral de 0,5 por componente y para la mezcla.

Es relevante ahora porque ejemplifica un patrón de despliegue de modelos tabulares/grafo en Hugging Face (formato joblib + checkpoint PyTorch), y porque su model card documenta de forma explícita una separación entre la versión de benchmark (con métricas) y la versión de despliegue (sin métricas aplicables), un matiz de procedencia que conviene entender antes de usar el artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble de dos componentes: `ExtraTreesClassifier` sobre bloque fp_desc (bits Morgan + MACCS + descriptores RDKit preparados) y GAT (graph attention network) sobre grafos moleculares; mezcla lineal ponderada 0,55/0,45 |
| Parametros totales | no disponible (el repo ocupa 0,0 GB; no se publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion molecular, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; artefactos en joblib y checkpoint PyTorch) |
| Idiomas soportados | no disponible (la entrada es una cadena SMILES, no texto en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `extratrees_model.joblib` (bundle con `model` + `prep` ajustado), `gat_model.pt` (checkpoint `state_dict` de la epoca 37), `config.json`, `extratrees_config.json`, `gat_config.json`, `deployment_common.py`, `infer.py`, `examples.json` |

## Arquitectura y entrenamiento

El sistema es un ensamble en dos ramas. La rama ExtraTrees (denominada Arch3) es un `ExtraTreesClassifier` entrenado sobre un bloque de características denominado fp_desc, que combina bits de Morgan, claves MACCS y descriptores RDKit preparados. La rama GAT (Arch2) es una red de atención sobre grafos que opera directamente sobre la representación gráfica de la molécula. La combinación se realiza como `blended_prob = 0.55 * ExtraTrees_prob + 0.45 * GAT_prob`, con umbral de 0,5 por componente y para la mezcla, y se reporta además la señal `flagged_by_both` (ambos componentes en o por encima de 0,5) como lectura de máxima preocupación del programa.

Ambos componentes son *refits* de despliegue sobre todo el pool: se entrenaron con la totalidad de los datos hepáticos etiquetados del programa (1.891 compuestos únicos), incorporando los compuestos del benchmark regulatorio solo en la parte de entrenamiento, nunca en validación ni test. La mezcla en sí no se reentrenó: el repositorio empaqueta los dos refits existentes con los pesos bloqueados de la combinación de benchmark. No se documentan en la información disponible el número de tokens (no aplica), la composición detallada del dataset ni el uso de RLHF/DPO.

## Capacidades

- Predicción de probabilidad de la clase de preocupación DILI (tóxica) a partir de una cadena SMILES.
- Salida por componente (`extratrees_prob`, `gat_prob`), probabilidad mezclada (`blended_prob`) y flags binarios por componente y para la mezcla.
- Señal `flagged_by_both` como indicador de máxima preocupación cuando ambos componentes superan el umbral.
- Manejo de estructuras no parseables: la probabilidad de un componente es `None` si ese componente no puede parsear la estructura, y la mezcla es `None` salvo que ambos componentes puntúen.
- Interfaz de inferencia combinada vía `infer.py` (uso por línea de comandos con `python3 infer.py "CCO"` y uso programático con `from infer import predict`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador molecular, no un modelo generativo.

## Casos de uso

- Triaje temprano de toxicidad hepática en descubrimiento de fármacos: dado un SMILES candidato, obtener una probabilidad DILI y un flag para priorizar qué compuestos requieren ensayos adicionales, aprovechando la naturaleza de alta sensibilidad del programa.
- Filtrado de librerías químicas: ejecutar `predict` sobre lotes de SMILES para descartar o marcar compuestos con `flagged_by_both` antes de fases costosas de síntesis o ensayo.
- Evaluación de toxicidad asociada a EGFR: la model card indica que este es el modelo hepático usado para la evaluación de toxicidad de EGFR en adelante, por lo que encaja en pipelines de selección de candidatos de esa diana.
- Análisis de concordancia entre representaciones: comparar `extratrees_prob` (descriptores globales) con `gat_prob` (estructura gráfica) para identificar compuestos donde ambas ramas discrepan, lo que puede señalar casos ambiguos que merecen revisión experta.
- Integración en servicios internos de quimioinformática: empaquetar `infer.py` y `deployment_common.py` en un microservicio que reciba SMILES y devuelva el JSON de probabilidades y flags.
- Reproducción y auditoría de decisiones regulatorias internas: usar `examples.json` con compuestos de ejemplo y sus probabilidades esperadas para verificar que el despliegue se comporta de forma consistente tras una reinstalación o cambio de entorno.

## Benchmarks y rendimiento

Los únicos números publicados corresponden a la *benchmark combination* (brazo de benchmark, con los conjuntos regulatorios fuera del entrenamiento), y la propia model card advierte que no describen este *refit* de despliegue:

| Metrica (benchmark arm) | Combinacion | GAT en solitario |
|---|---|---|
| AUROC regulatorio agrupado | 0,758 | 0,788 |
| Captura de fármacos retirados | 67/71 | 66/71 |

No se han publicado resultados de benchmarks aplicables a la versión de despliegue en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB y no se publica recuento de parámetros ni huella de memoria.
- GPU recomendadas: no disponible. Al ser un `ExtraTreesClassifier` (CPU-friendly) más un GAT sobre grafos moleculares pequeños, es probable que la inferencia sea viable en CPU, pero no se documenta en la información proporcionada.
- Cabeza en GPU de consumo: no confirmado; por la naturaleza de los artefactos (joblib + checkpoint pequeño) es plausible, pero no hay dato publicado.
- Opciones de despliegue: el propio repositorio proporciona `infer.py` y `deployment_common.py` con dependencias en `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delower/liver-best_gat_extratrees-deployment | Ensamble ExtraTrees + GAT para DILI | no disponible | no aplica | MIT | Hugging Face (0 descargas) |
| Delower/liver-extratrees-deployment | ExtraTrees sobre fp_desc para DILI | no disponible | no aplica | no disponible | Hugging Face (repo fuente citado) |
| Delower/liver-gat-deployment | GAT sobre grafos moleculares para DILI | no disponible | no aplica | no disponible | Hugging Face (repo fuente citado) |

No se dispone de datos de rendimiento comparables entre estos repositorios en la información proporcionada; los dos repositorios de componentes son las alternativas naturales dentro del mismo programa.

## Limitaciones y advertencias

- Las métricas de benchmark (AUROC 0,758; captura 67/71) no aplican a esta versión de despliegue, porque los conjuntos regulatorios están dentro de sus datos de entrenamiento; no debe citarse ningún número de test para este refit.
- El programa es deliberadamente de alta sensibilidad y baja especificidad: en cribados previos de DPP-4 ambos componentes marcaron más del 90 % de los leads potentes. Un flag es una preocupación a triar, no un veredicto.
- Riesgo de falsos positivos elevado por diseño; no debe usarse como criterio único de descarte.
- Sesgos conocidos: no documentados en la información disponible; el rendimiento puede degradarse en quimiotipos poco representados en los 1.891 compuestos del pool.
- La mezcla devuelve `None` si alguno de los componentes no puede parsear la estructura, lo que exige gestionar valores nulos en producción.
- Licencia MIT, que permite uso comercial, pero sin garantías ni datos de validación externa publicados para esta versión.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento; la única entrada válida es una cadena SMILES.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/liver-best_gat_extratrees-deployment
- Repositorio del componente ExtraTrees: https://huggingface.co/Delower/liver-extratrees-deployment
- Repositorio del componente GAT: https://huggingface.co/Delower/liver-gat-deployment
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
