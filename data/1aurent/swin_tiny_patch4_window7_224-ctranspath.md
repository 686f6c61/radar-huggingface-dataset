# 1aurent/swin_tiny_patch4_window7_224.CTransPath

## Resumen

`swin_tiny_patch4_window7_224.CTransPath` es un backbone de extracción de características basado en Swin Transformer, adaptado por el usuario de Hugging Face `1aurent` a partir del modelo original CTransPath de Xiyue Wang. Está especializado en imágenes de histología (patología digital) y se distribuye a través de la librería `timm`, lo que facilita su integración en pipelines de visión por computador existentes. El modelo cuenta con 27,7 millones de parámetros y procesa parches de imagen de 224 x 224 x 3 píxeles.

El problema que resuelve es la necesidad de un extractor de características robusto y preentrenado específicamente para tejido histológico, un dominio donde los modelos genéricos de ImageNet rinden peor. CTransPath se entrenó con aprendizaje contrastivo auto-supervisado sobre aproximadamente 15 millones de parches de histología provenientes de los conjuntos PAIP y TCGA, lo que le permite generar representaciones útiles para tareas posteriores como clasificación de subtipos tumorales, predicción de biomarcadores moleculares o estimación de supervivencia.

Es relevante ahora porque la patología computacional requiere backbones ligeros que puedan ejecutarse sobre miles de parches por portaobjetos en entornos con recursos limitados, y este modelo ofrece un equilibrio entre tamaño reducido (0,2 GB de repositorio) y rendimiento validado en múltiples tareas de TCGA y Camelyon16. Su licencia GPL-3.0, eso sí, condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (variante tiny, patch 4, ventana 7, entrada 224) con ConvStem personalizado |
| Parámetros totales | 27.769.814 (27,5 M según model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224 x 224 x 3) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización posterior vía PyTorch/timm, no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de imagen; sin capacidades de texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un Swin Transformer en configuración tiny: atención por ventanas desplazadas de 7 x 7 sobre una jerarquía de mapas de características, con un `ConvStem` personalizado que sustituye al patch embedding estándar. Ese stem aplica dos bloques de convolución 3x3 con stride 2 seguidos de una convolución 1x1 para proyectar a la dimensión de embedding, una adaptación tomada del código original de CTransPath (`ctran.py`) y pensada para mejorar la extracción de texturas finas en imágenes histológicas. La entrada es de 224 x 224 píxeles con 3 canales.

El preentrenamiento siguió el esquema de aprendizaje contrastivo auto-supervisado descrito en el artículo "Transformer-based unsupervised contrastive learning for histopathological image classification" (Medical Image Analysis, 2022), sobre aproximadamente 15 millones de parches de histología de PAIP y TCGA. No se documenta en la información disponible un ajuste posterior con RLHF, DPO ni supervisión densa; el modelo se publica como backbone de características y clasificación, no como modelo generativo.

## Capacidades

- Extracción de características visuales de parches histológicos de 224 x 224 píxeles, devolviendo embeddings de dimensión fija utilizables en tareas downstream.
- Clasificación de imágenes mediante una cabeza lineal sobre las features extraídas (el model-index reporta resultados de clasificación en múltiples datasets de TCGA y Camelyon16).
- Transferencia a tareas de patología computacional: subtipificación tumoral, predicción de estado molecular (MSI, HRD), tipo histológico y estimación de supervivencia global.
- Integración nativa con `timm` (`timm.create_model`), lo que permite congelar el backbone, extraer features por capas y combinarlo con clasificadores ligeros.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.

## Casos de uso

- **Clasificación de subtipos tumorales en portaobjetos completos**: se extraen parches de 224 x 224 del WSI, se pasan por el backbone para obtener embeddings y se entrena un clasificador (p. ej. regresión logística o MLP) por paciente. El modelo es adecuado por su preentrenamiento específico en histología y su bajo coste computacional por parche.
- **Predicción de biomarcadores moleculares a partir de morfología**: el model-index reporta ROC AUC de 88,5 en MSI de TCGA-CRC y 83,2 en MSI de TCGA-STAD, lo que respalda su uso como extractor en pipelines de predicción de inestabilidad de microsatélites sin secuenciación.
- **Detección de metástasis en ganglios linfáticos**: con ROC AUC de 96,3 en Camelyon16[Meta], el modelo sirve como base para sistemas de cribado de metástasis en imágenes de ganglios, un caso clásico de patología asistida por ordenador.
- **Predicción de supervivencia global (OS)**: los resultados reportados en TCGA-BRCA[OS] (65,0), TCGA-COAD[OS] (64,3), TCGA-LUAD[OS] (59,1), TCGA-LUSC[OS] (61,5) y TCGA-PAAD[OS] (59,0) indican que las features capturan señal pronóstica, útil para modelos de riesgo con supervisión débil.
- **Preentrenamiento y fine-tuning en dominios histológicos propios**: al ser un backbone `timm` de 27,5 M de parámetros, se puede afinar sobre datasets locales pequeños (p. ej. un servicio de anatomía patológica con pocos cientos de casos) con requisitos de GPU modestos.
- **Búsqueda por similitud de imágenes patológicas**: los embeddings permiten construir índices vectoriales para recuperar casos morfológicamente similares en archivos hospitalarios, útil para control de calidad y docencia.
- **Extracción de features para modelos multimodales**: las representaciones pueden alimentar cabezas que combinen imagen con datos clínicos tabulares (edad, estadio, biomarcadores) en modelos de pronóstico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (métrica ROC AUC, no verificados de forma independiente):

| Dataset / tarea | ROC AUC |
|---|---|
| Camelyon16[Meta] | 96,3 ± 2,6 |
| TCGA-BRCA[Hist] | 95,8 ± 0,5 |
| TCGA-BRCA[HRD] | 77,1 ± 2,5 |
| TCGA-BRCA[Mol] | 80,8 ± 1,7 |
| TCGA-BRCA[OS] | 65,0 ± 6,0 |
| TCGA-CRC[MSI] | 88,5 ± 2,3 |
| TCGA-COAD[OS] | 64,3 ± 5,4 |
| TCGA-NSCLC[CType] | 97,3 ± 0,4 |
| TCGA-LUAD[OS] | 59,1 ± 4,5 |
| TCGA-LUSC[OS] | 61,5 ± 2,9 |
| TCGA-OV[HRD] | 69,5 ± 7,0 |
| TCGA-RCC[CType] | 98,9 ± 0,2 |
| TCGA-STAD[MSI] | 83,2 ± 8,1 |
| TCGA-PAAD[OS] | 59,0 ± 4,2 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de visión.

## Requisitos de hardware

- **VRAM para inferencia**: al tratarse de un modelo de 27,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 110 MB; en fp16, unos 55 MB. La VRAM real depende del tamaño de lote y de la resolución de entrada (fija a 224 x 224).
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia por lotes. Para entrenamiento de cabezas de clasificación sobre features congeladas, una RTX 3060/4060 o superior es adecuada; para fine-tuning completo, se recomienda RTX 3090/4090, A100 o H100 por throughput.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna (GTX 1650 en adelante), e incluso en CPU para inferencia por parches con latencia aceptable.
- **Opciones de despliegue**: `timm` + PyTorch como vía principal; exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; `torch.compile` para acelerar; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia cualitativa, un Swin-T a 224 x 224 procesa cientos de parches por segundo en una GPU moderna con lotes grandes, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swin_tiny_patch4_window7_224.CTransPath | 27,5 M | 224 x 224 x 3 | Contrastivo auto-supervisado en 15 M parches histológicos (PAIP + TCGA) | GPL-3.0 | Hugging Face (`1aurent/...`), `timm` |
| Swin-Tiny ImageNet (timm) | ~28 M | 224 x 224 x 3 | Supervisado en ImageNet-1k | Apache-2.0 (según variante timm) | Hugging Face / `timm` |
| ResNet-50 ImageNet | ~25 M | 224 x 224 x 3 | Supervisado en ImageNet-1k | BSD-3 / Apache-2.0 según implementación | Amplia |
| CTransPath original (repo Xiyue-Wang) | ~27,5 M | 224 x 224 x 3 | Igual que este modelo (origen) | GPL-3.0 | GitHub |

La comparación con Swin-Tiny y ResNet-50 de ImageNet es pertinente porque son los backbones genéricos habituales en patología computacional; el valor de CTransPath reside en su preentrenamiento específico de dominio, no en el tamaño. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada más allá de los resultados del model-index de este modelo.

## Limitaciones y advertencias

- **Licencia GPL-3.0**: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; conviene revisar con asesoría legal antes de uso comercial.
- **Sesgo de dominio**: entrenado con parches de PAIP y TCGA, mayoritariamente de cánceres humanos de poblaciones y protocolos de tinción concretos; el rendimiento puede degradarse con otras tinciones (p. ej. H&E de otros laboratorios), escáneres o tejidos no oncológicos.
- **Riesgo de alucinación en sentido amplio**: al ser un extractor discriminativo, no genera texto, pero un clasificador construido sobre sus features puede producir predicciones sobreconfiadas en parches fuera de distribución (artefactos, tejido necrótico, mala calidad de escaneo).
- **Métricas no verificadas**: los ROC AUC del model-index están marcados como `verified: false`; deben reproducirse de forma independiente antes de usarse como referencia clínica.
- **Sin contexto textual ni multilingüe**: no procesa informes, metadatos ni texto clínico; cualquier pipeline multimodal debe añadir componentes externos.
- **Resolución fija**: la entrada es 224 x 224; parches mayores requieren redimensionado o procesamiento por ventanas, lo que puede perder detalle diagnóstico.
- **Uso clínico**: no es un dispositivo médico ni está validado regulatoriamente; cualquier aplicación en diagnóstico debe pasar por validación prospectiva y cumplimiento normativo (MDR/IVDR en la UE).
- **Sin datos de calibración ni incertidumbre**: no se documentan métodos de calibración de probabilidades ni estimación de incertidumbre, relevantes en entornos clínicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/swin_tiny_patch4_window7_224.CTransPath
- Paper: Transformer-based unsupervised contrastive learning for histopathological image classification: https://www.sciencedirect.com/science/article/abs/pii/S1361841522002043
- Repositorio original CTransPath: https://github.com/Xiyue-Wang/TransPath
- Licencia original: https://github.com/Xiyue-Wang/TransPath/blob/main/LICENSE.md
- Portal TCGA (GDC): https://portal.gdc.cancer.gov/
- Librería `timm`: https://github.com/huggingface/pytorch-image-models
