# RL8596/pneumoshift-kids-plus-adults

## Resumen

PneumoShift kids_plus_adults es un clasificador de imagen binario desarrollado por el usuario RL8596, construido sobre una arquitectura `resnet18.tv_in1k` de la librería `timm`. Su única salida es la probabilidad de que una radiografía de tórax frontal muestre neumonía. Forma parte de un proyecto académico que investiga si un modelo entrenado con radiografías pediátricas mantiene su utilidad al aplicarse sobre pacientes adultos, un problema relevante de generalización de dominio en imagen médica.

El modelo combina 4.578 radiografías infantiles del conjunto Kermany (niños de 1 a 5 años, un hospital de Guangzhou, China, licencia CC BY 4.0) con 6.000 radiografías adultas del desafío RSNA Pneumonia Detection 2018 (Estados Unidos). Con 11.186.625 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a experimentación e investigación, no a despliegue clínico.

Es relevante ahora por su enfoque explícito en el *shift* de dominio entre poblaciones pediátrica y adulta, y por incorporar mecanismos de calibración (temperature scaling) y detección de datos fuera de distribución (`ood.npz`). El autor declara de forma taxativa que no es un dispositivo médico ni sirve para diagnóstico, lo que condiciona por completo su uso legítimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (`resnet18.tv_in1k`, torchvision) vía `timm` |
| Parametros totales | 11.186.625 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una ResNet-18 estándar preentrenada en ImageNet-1k (`tv_in1k`) y adaptada a clasificación binaria con una única salida logit. No se documenta en la model card el número total de tokens ni el número de épocas, la resolución de entrada, el optimizador ni si se aplicó *fine-tuning* completo o parcial. La innovación técnica declarada es la calibración de la probabilidad mediante temperature scaling con temperatura 1,043: `probability = sigmoid(logit / 1.043)`.

El conjunto de entrenamiento declarado suma 10.578 radiografías (4.578 pediátricas de Kermany y 6.000 adultas de RSNA adapt). El umbral de decisión se fija en 0,1575, elegido para alcanzar una sensibilidad del 95 % en el conjunto de validación. El repositorio incluye, si está presente, un fichero `ood.npz` con estadísticas para emitir una advertencia cuando la imagen de entrada se aleja de la distribución de entrenamiento. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos.

## Capacidades

- Clasificación binaria de radiografías de tórax frontales: probabilidad de neumonía frente a normal.
- Salida calibrada mediante temperature scaling (temperatura 1,043).
- Umbral de decisión predefinido (0,1575) orientado a alta sensibilidad (95 % en validación).
- Generación de mapa de calor (*heatmap*) asociado a la predicción, según la interfaz `Predictor`.
- Indicador de nivel fuera de distribución (`ood_level`) basado en `ood.npz`.
- Interfaz de inferencia empaquetada en `pneumoshift.inference.Predictor`.

## Casos de uso

- Investigación sobre generalización de dominio en imagen médica: comparar el rendimiento del modelo en cohortes pediátricas y adultas para estudiar cómo se degrada la sensibilidad y la especificidad al cambiar la población, usando los conjuntos de test documentados.
- Docencia en cursos de *machine learning* médico: ilustrar el efecto de la calibración (temperature scaling) y de los umbrales de sensibilidad sobre las métricas de un clasificador binario.
- Evaluación de pipelines de detección de datos fuera de distribución: emplear `ood.npz` y `ood_level` como caso práctico para medir la fiabilidad de las advertencias ante radiografías atípicas.
- Triaje experimental en entornos de investigación: usar la salida de probabilidad y el umbral de 0,1575 para simular la priorización de radiografías, siempre con revisión humana obligatoria y sin valor clínico.
- Reproducción de experimentos con `timm`: cargar los pesos safetensors en un *script* de evaluación y comparar contra el `resnet18.tv_in1k` original para medir el efecto del *fine-tuning* médico.
- Estudio de sesgos entre cohortes: analizar las diferencias de especificidad entre niños (0,457) y adultos (0,948) como ejemplo de cómo el origen de los datos condiciona el comportamiento del modelo.
- Integración como componente de demostración en herramientas de anotación: mostrar probabilidad, mapa de calor y advertencia OOD junto a la imagen para formación de anotadores.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de test no usados en entrenamiento:

| Conjunto de test | N | Sensibilidad | Especificidad | AUROC |
|---|---|---|---|---|
| children_test (Kermany, neumonía vs normal) | 624 | 1,000 | 0,457 | 0,962 |
| adults_test (RSNA, opacidad pulmonar vs normal) | 4.242 | 0,911 | 0,948 | 0,979 |
| adults_test (RSNA, opacidad pulmonar vs todo lo demás) | 7.694 | 0,911 | 0,650 | 0,874 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un lote pequeño, dado el tamaño de 11,2 M de parámetros; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se documentan recomendaciones del autor.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `timm`/PyTorch como vía principal; el paquete `pneumoshift.inference` como interfaz de alto nivel. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PneumoShift kids_plus_adults | 11,2 M | Clasificación binaria de neumonía en radiografía | no aplica | MIT | Hugging Face |
| ResNet-18 (`resnet18.tv_in1k`) | 11,7 M | Clasificación ImageNet-1k (1.000 clases) | no aplica | BSD-3 (torchvision) | Hugging Face / torchvision |
| Alternativas específicas de neumonía en radiografía | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros clasificadores de neumonía en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente: modelo de investigación, no es un dispositivo médico, no sirve para diagnóstico.
- Solo ha aprendido de los grupos de pacientes y hospitales listados (Guangzhou pediátrico y RSNA adulto); para otras edades, hospitales o equipos de rayos X puede equivocarse con alta confianza.
- Clasificación binaria (neumonía o no); no reconoce otros hallazgos radiológicos.
- La advertencia de datos fuera de distribución detecta muchas radiografías atípicas, pero no todas.
- No ha sido validado por ninguna autoridad reguladora.
- La especificidad en el conjunto pediátrico es muy baja (0,457), lo que implica un volumen elevado de falsos positivos en ese dominio.
- Sesgos conocidos: no se documentan análisis de sesgo por sexo, etnia o equipo, pero la procedencia limitada de los datos (dos hospitales) sugiere riesgo de sesgo poblacional e institucional.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones confiadas e incorrectas fuera de la distribución de entrenamiento.
- Licencia MIT permite uso comercial del código y los pesos, pero el uso clínico o diagnóstico queda fuera del ámbito previsto por el autor y puede contravenir normativa sanitaria.
- Para producción: no apto para uso clínico, triaje real ni decisiones que afecten a pacientes sin supervisión humana y validación regulatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL8596/pneumoshift-kids-plus-adults
- Dataset Kermany et al. 2018 (referencia citada en la model card): no disponible enlace directo
- RSNA Pneumonia Detection Challenge 2018 (referencia citada): no disponible enlace directo
- Librería `timm`: no disponible enlace en la información proporcionada
- Repositorio o paper del proyecto PneumoShift: no disponible
