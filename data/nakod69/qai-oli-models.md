# Nakod69/qai-oli-models

## Resumen

QAI-OLI es un sistema de clasificación de imágenes clínicas orientado al cribado de oncología oral, desarrollado por un equipo del departamento de ingeniería de ARMIET (University of Mumbai) liderado por Kshitij Nakod. No es un modelo de lenguaje: se trata de un ensemble de tres redes neuronales convolucionales e híbridas cuántico-clásicas entrenadas para distinguir cuatro clases diagnósticas (sano, benigno, OPMD/displasia y carcinoma maligno) a partir de imágenes macroscópicas de lesiones orales.

El sistema combina tres flujos paralelos: ConvNeXt-V2-Tiny (especialista en bordes y contornos de lesión), DenseNet-121 (especialista en morfología celular y patrones vasculares) y un circuito variacional cuántico de 8 qubits implementado con PennyLane (decisor final en espacio de Hilbert de 256 dimensiones). Las predicciones se fusionan mediante soft-voting ponderado (25% / 25% / 50%) para producir el diagnóstico final.

Su relevancia radica en la aplicación de computación cuántica parametrizada a un problema clínico concreto con métricas declaradas de cribado (98,40% de especificidad en triaje de tejido sano y 89,40% de F1 en aislamiento de carcinoma). Los pesos no se distribuyen públicamente: se solicitan por correo al autor principal, lo que limita la reproducibilidad y la auditoría independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres redes: ConvNeXt-V2-Tiny, DenseNet-121 y VQC híbrido de 8 qubits (PennyLane) |
| Parametros totales | no disponible (tamaños de checkpoint: 107,1 MB + 28,1 MB + 152,1 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `.pth` de precisión nativa) |
| Idiomas soportados | no aplica (modelo de clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), distribuidos solo bajo solicitud por correo |

## Arquitectura y entrenamiento

El sistema es un ensemble de tres etapas con fusión por soft-voting ponderado. La etapa 1 usa ConvNeXt-V2-Tiny (107,1 MB) para extraer contornos macroscópicos, bordes irregulares y márgenes de lesión. La etapa 2 emplea DenseNet-121 (28,1 MB) para capturar microvascularización epitelial y atipia celular mediante reutilización densa de características. La etapa 3 es un circuito variacional cuántico de 8 qubits con AngleEmbedding parametrizado y capas de entrelazamiento, que proyecta las características latentes en un espacio de Hilbert de 256 dimensiones y las combina con una vía clásica de salto de 64 dimensiones.

La formulación de consenso es `P_fused = 0,25·P_M1 + 0,25·P_M2 + 0,50·P_M3`. No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, el origen de las muestras ni si se aplicaron técnicas de aumento de datos, validación cruzada o ajuste fino con supervisión humana. Tampoco se detalla el proceso de calibración de las probabilidades softmax mencionado en la model card.

## Capacidades

- Clasificación de imágenes macroscópicas de lesiones orales en cuatro clases: sano, benigno, OPMD (trastorno oral potencialmente maligno) y carcinoma.
- Triaje de cribado de tejido sano con especificidad declarada del 98,40%.
- Aislamiento de carcinoma maligno con F1 de 89,40% y sensibilidad del 90,43%.
- Discriminación entre benigno y OPMD con precisión del 83,77%.
- Extracción de características espaciales de bordes y contornos de úlceras (ConvNeXt-V2-Tiny).
- Extracción de patrones celulares y microvasculares (DenseNet-121).
- Decisión final en espacio de Hilbert cuántico de 256 dimensiones (VQC de 8 qubits).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen cerrado.

## Casos de uso

- Cribado primario en campañas de salud oral: el modelo puede procesar fotografías intraorales capturadas con smartphones o cámaras clínicas y priorizar los casos sospechosos, aprovechando la especificidad del 98,40% para reducir falsos positivos en poblaciones sanas.
- Segunda lectura en consulta odontológica: integrado en el flujo de captura de imagen, el ensemble puede señalar lesiones con bordes irregulares o patrones vasculares anómalos que el clínico podría pasar por alto en revisiones rutinarias.
- Triaje remoto en zonas con escasez de especialistas: al ser un pipeline de inferencia ligero (checkpoints de 287,3 MB en total), puede desplegarse en servidores modestos y priorizar derivaciones a maxilofacial.
- Investigación en biomarcadores visuales de OPMD: la separación entre las tres etapas permite analizar qué características aporta cada rama (bordes, morfología celular, decisión cuántica) a la clasificación final.
- Docencia y validación de modelos cuánticos aplicados: el VQC de 8 qubits sirve como caso de estudio reproducible (previo acceso a pesos) para comparar el rendimiento de circuitos variacionales frente a cabezas clásicas.
- Auditoría de sesgo en datasets odontológicos: al ser un ensemble con pesos por rama, permite estudiar la contribución de cada modalidad visual a los errores de clasificación en subgrupos demográficos.

## Benchmarks y rendimiento

| Modelo / etapa | Precisión standalone | F1 OCA |
|---|---|---|
| ConvNeXt-V2-Tiny (etapa 1) | 70,06% | 83,2% |
| DenseNet-121 (etapa 2) | 61,60% | 80,5% |
| VQC 8 qubits (etapa 3) | 78,64% | 84,9% |
| Ensemble completo (fusión) | 83,77% (discriminación benigno vs OPMD) | 89,40% (carcinoma) |

| Métrica clínica del ensemble | Valor |
|---|---|
| Especificidad en triaje de sano | 98,40% |
| Sensibilidad / recall en carcinoma | 90,43% |
| F1 en carcinoma | 89,40% |
| Precisión benigno vs OPMD | 83,77% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje. No se dispone de comparación con datasets públicos de referencia ni de intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para los tres checkpoints (287,3 MB de pesos totales), con margen para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El cuello de botella es la simulación del VQC, no las CNN.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o superior, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el pipeline se sirve con `server.py` (no incluido en la información disponible); requiere PyTorch y PennyLane para la etapa cuántica. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QAI-OLI | Ensemble CNN + VQC para oncología oral | 287,3 MB en 3 checkpoints | no aplica | no disponible | Solo bajo solicitud por correo |
| ConvNeXt-V2-Tiny (base) | CNN de visión | 28,9 M parámetros aprox. | no aplica | MIT (upstream) | Pública en Hugging Face |
| DenseNet-121 (base) | CNN de visión | 8,0 M parámetros aprox. | no aplica | BSD-3 (upstream) | Pública en torchvision |
| Modelos de clasificación médica de imagen open source | CNN / ViT médicos | variable | no aplica | variable | Públicos en Hugging Face |

No se dispone de comparaciones directas con otros ensembles clínicos de oncología oral publicados, ni de resultados en datasets públicos comunes que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Los pesos no son públicos: la distribución requiere solicitud por correo al autor, lo que impide reproducibilidad independiente y auditoría del entrenamiento.
- No se especifica la licencia, por lo que el uso comercial, la redistribución y la modificación quedan en un limbo legal.
- Las métricas declaradas (83,77%, 98,40%, 89,40%) no están respaldadas por un paper revisado por pares ni por un dataset público identificado en la información disponible.
- El VQC de 8 qubits se ejecuta en simulación (PennyLane), no en hardware cuántico real; el coste computacional y el comportamiento en hardware físico no están documentados.
- Riesgo de sesgo demográfico y de adquisición: no se describe la composición del dataset de entrenamiento (país, etnia, tipo de cámara, iluminación), lo que puede degradar el rendimiento fuera del dominio de captura original.
- Riesgo de alucinación clínica: como clasificador, puede producir falsos negativos en lesiones sutiles; no debe usarse como diagnóstico autónomo sin validación por especialista.
- Las clases OPMD y benigno son especialmente propensas a confusión (precisión del 83,77%), por lo que la salida requiere revisión humana en ese eje.
- No hay información sobre validación externa, intervalos de confianza ni curvas ROC.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y el tamaño del repo (0,3 GB) sugiere que contiene documentación y no los pesos completos.

## Enlaces

- Hugging Face: https://huggingface.co/Nakod69/qai-oli-models
- GitHub del autor principal: https://github.com/kshitij5228
- Contacto del autor principal: nakod.kshitij5228@gmail.com
- PennyLane (framework cuántico citado): https://pennylane.ai
- ConvNeXt-V2 (arquitectura base): https://github.com/facebookresearch/ConvNeXt-V2
- DenseNet (arquitectura base): https://github.com/liuzhuang13/DenseNet
