# MIC-DKFZ/SSL3D-checkpoints

## Resumen

SSL3D-checkpoints es una colección de pesos preentrenados de codificadores para imagen médica 3D, publicada por MIC-DKFZ (División de Computing de la Universidad de Heidelberg) como resultado del reto SSL3D sobre aprendizaje autosupervisado en imagen médica tridimensional. No es un modelo único, sino un repositorio de 17 checkpoints (`.pth`) que agrupa las propuestas de distintos equipos participantes junto con la línea base MAE de los organizadores. Todos los codificadores se preentrenaron sobre OpenMind, un corpus a gran escala de resonancia magnética cerebral 3D.

El repositorio cubre dos pistas arquitectónicas: ResEnc-L, un codificador convolucional basado en la variante ResEnc de nnU-Net, y Primus-M, un codificador transformer (Primus-M). Cada checkpoint es un extractor de características que debe someterse a ajuste fino supervisado para tareas posteriores de segmentación o clasificación, no un modelo generativo listo para inferencia directa. Su relevancia radica en que estandariza y hace comparables distintas estrategias de autosupervisión 3D (MAE, contraste, destilación, desacoplamiento anatómico) bajo un mismo protocolo de evaluación y un mismo conjunto de datos.

El interés práctico está en reutilizar estos codificadores como inicialización en pipelines de nnU-Net o nnFoundation, reduciendo la necesidad de datos anotados en tareas de segmentación y clasificación de volúmenes médicos. El repositorio ocupa 22,1 GB y se distribuye bajo licencia CC BY 4.0, la misma del dataset OpenMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos pistas: CNN (nnU-Net ResEnc-L) y transformer (Primus-M) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada volumetrica 3D; sin contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento, `.pth`) |
| Idiomas soportados | no aplica (modelo de imagen medica, sin capacidades linguisticas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias de codificadores. La pista ResEnc-L emplea el codificador convolucional ResEnc-L de nnU-Net, una U-Net residual adaptada a volúmenes 3D. La pista Primus-M emplea un codificador transformer (Primus-M) para el mismo tipo de entrada. En ambos casos se trata de extractores de características entrenados de forma autosupervisada, sin cabeza de tarea supervisada, que después se ajustan de forma supervisada para segmentación (nnU-Net) o clasificación (nnFoundation).

El preentrenamiento se realizó íntegramente sobre OpenMind, un dataset a gran escala de resonancia magnética cerebral 3D presentado por Wald et al. en ICCV. Las estrategias de autosupervisión representadas incluyen MAE (línea base de los organizadores), VoxCon, destilación autosupervisada multiescala por vóxel (Vox-MSD), aprendizaje contrastivo variacional (VCL), VoCo combinado con MAE, desacoplamiento con anclaje anatómico, BigSimCLR-3D, autoencoder enmascarado generalizado (GMAE), alineación de vistas consistente (CVA), autodestilación tipo DINOv2 y MAE filtrado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Extracción de características autosupervisadas de volúmenes de resonancia magnética cerebral 3D.
- Inicialización para ajuste fino supervisado en segmentación 3D mediante nnU-Net.
- Inicialización para ajuste fino supervisado en clasificación mediante nnFoundation.
- Representaciones transferibles con pocos datos anotados (el objetivo del reto es evaluar la calidad de las representaciones).
- Dos arquitecturas alternativas (CNN y transformer) para el mismo tipo de entrada.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión 2D, audio ni otras capacidades multimodales.

## Casos de uso

- Segmentación de estructuras cerebrales con pocas anotaciones: se carga un checkpoint ResEnc-L o Primus-M como inicialización del codificador de nnU-Net y se ajusta con un conjunto pequeño de volúmenes etiquetados, aprovechando las representaciones aprendidas sobre OpenMind.
- Clasificación de volúmenes de RM cerebral: se integra el codificador en el pipeline de nnFoundation para tareas de clasificación diagnóstica, reduciendo el coste de anotación frente a entrenar desde cero.
- Comparación metodológica de estrategias de autosupervisión: investigadores que evalúan MAE, contraste, destilación o desacoplamiento pueden reutilizar los checkpoints del reto bajo un protocolo común.
- Reproducción de resultados del reto SSL3D: los checkpoints permiten replicar los envíos de cada equipo y verificar las conclusiones del manuscrito asociado.
- Investigación en aprendizaje autosupervisado 3D: sirven como punto de partida para estudiar transferencia entre dominios de imagen médica y sensibilidad al preentrenamiento.
- Desarrollo de herramientas de apoyo al diagnóstico en neurología y radiología: un codificador ajustado puede alimentar sistemas de segmentación de lesiones o tejidos para revisión por especialistas, siempre con validación clínica independiente.
- Estudios de eficiencia de datos: comparar el rendimiento de cada checkpoint con distintos porcentajes de datos etiquetados para caracterizar la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas por checkpoint ni tablas comparativas de rendimiento; únicamente referencia el manuscrito del reto y los papers de cada método.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del volumen de entrada y de la arquitectura concreta. El repositorio completo ocupa 22,1 GB, pero cada checkpoint individual es sustancialmente menor.
- GPU recomendadas: no disponible en la información proporcionada. Por el tipo de carga (volúmenes 3D y codificadores CNN/transformer), se requiere GPU con memoria suficiente para el volumen y el lote; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los checkpoints están en formato PyTorch `.pth` y se usan mediante nnU-Net y nnFoundation (repositorios de MIC-DKFZ); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / entrada | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSL3D-checkpoints (este) | CNN (ResEnc-L) y transformer (Primus-M) | Volumen RM cerebral 3D | no disponible | CC BY 4.0 | Hugging Face (MIC-DKFZ) |
| Modelos de imagen médica 3D de nnU-Net (entrenamiento desde cero) | CNN U-Net | Volumen 3D | no disponible | Apache 2.0 (nnU-Net) | GitHub MIC-DKFZ |
| Codificadores autosupervisados 3D genéricos (p. ej. basados en MAE) | Transformer / CNN | Volumen 3D | no disponible | variable | variable |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no admite prompts de texto ni tareas de lenguaje.
- Los checkpoints son codificadores sin cabeza de tarea; requieren ajuste fino supervisado antes de uso en producción.
- Entrenados exclusivamente sobre OpenMind (RM cerebral); el rendimiento en otras modalidades (TC, PET) u otras regiones anatómicas no está caracterizado.
- Riesgo de sesgo poblacional y de adquisición heredado del dataset de preentrenamiento; no se documentan análisis de sesgo en la información disponible.
- Riesgo de sobreajuste al dominio cerebral y de degradación al transferir a escáneres o protocolos distintos.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar OpenMind y los trabajos correspondientes a cada checkpoint.
- No apto para uso clínico directo sin validación regulatoria y supervisión profesional.
- Dos checkpoints (Anonymous, GMAE) no incluyen código ni paper asociados, lo que dificulta su reproducibilidad.
- No se documentan límites de resolución, tamaño de parche ni requisitos de preprocesado más allá de los pipelines de nnU-Net y nnFoundation.

## Enlaces

- Hugging Face: https://huggingface.co/MIC-DKFZ/SSL3D-checkpoints
- Dataset OpenMind: https://huggingface.co/datasets/MIC-DKFZ/OpenMind
- nnssl: https://github.com/MIC-DKFZ/nnssl
- nnU-Net (ajuste fino desde checkpoints nnssl): https://github.com/MIC-DKFZ/nnUNet/blob/master/documentation/finetuning_from_nnssl_checkpoints.md
- nnFoundation (clasificación): https://github.com/MIC-DKFZ/image_classification/blob/master/docs/nnfoundation.md
- VoxCon: https://github.com/pwesp/voxcon
- VCL: https://github.com/verimsu/VCL
- VoCo + MAE: https://github.com/HenryLiu0402/nnssl_VoCo-plus-MAE
- MAE-filtered: https://github.com/HenryLiu0402/nnssl_MAE-filtered-1k
- BrainFM4Challenges (rama `ssl3d_model`): https://github.com/jbanusco/BrainFM4Challenges/tree/ssl3d_model
- SSL3D_Challenge (PVG): https://github.com/emilykaczmarek/SSL3D_Challenge
- LatentCampus (CVA): https://github.com/Tenbatsu24/LatentCampus
- ct-dino (DINOv2): https://github.com/xdoni4/ct-dino
- arXiv:2601.13166: https://arxiv.org/abs/2601.13166
- arXiv:2509.13846: https://arxiv.org/abs/2509.13846
- arXiv:2412.17041: https://arxiv.org/abs/2412.17041
- arXiv:2312.00824: https://arxiv.org/abs/2312.00824
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
