# harshitrk07/MAMAGuard-Net

## Resumen

MAMAGuard-Net es una colección de checkpoints de segmentación de tumores mamarios en resonancia magnética con contraste dinámico (DCE-MRI), publicada por Harshit Ravindra Kulkarni, Harshit Aman y Malathi D. No se trata de un modelo de lenguaje, sino de un conjunto de 25 pesos finales de nnU-Net v2 con configuración ResEncL, organizados en cinco configuraciones de aumento de datos (A0 a A4) y cinco folds por configuración (semilla 20261031). El artefacto acompaña al manuscrito *Testing Phase-Consistent Intensity Randomization for Multicentre Breast Tumour Segmentation in Dynamic Contrast-Enhanced MRI*.

La relevancia del release es metodológica: los autores comparan el aumento de datos estándar de nnU-Net con variantes que manipulan la intensidad y el orden de las fases del estudio DCE (precontraste, postcontraste temprano y postcontraste tardío), incluyendo una variante con restricciones de orden de fase (A4). Los checkpoints permiten reproducir la validación cruzada interna y analizar el efecto de cada esquema de aumentación sobre la segmentación.

El repositorio ocupa 28,3 GB e incluye, junto a los pesos, los ficheros `plans.json` y `dataset.json` necesarios para la inferencia con nnU-Net. Los pesos se publican únicamente para investigación; no se ha establecido su uso clínico ni su generalización a la cohorte independiente de Yunnan, y no se ha declarado una licencia de reutilización separada para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 con configuración ResEncL (encoder residual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible (no se ha declarado licencia de reutilización para los pesos) |
| Formato de pesos | checkpoints PyTorch (`checkpoint_final.pth`) con metadatos nnU-Net (`plans.json`, `dataset.json`) |

## Arquitectura y entrenamiento

El modelo sigue el pipeline de nnU-Net v2 en su configuración ResEncL, orientada a segmentación volumétrica 3D. La entrada se compone de tres canales en el orden original del estudio DCE: precontraste, postcontraste temprano y postcontraste tardío. Cada checkpoint incluye el plan de entrenamiento y el descriptor del dataset del mismo directorio experimental, lo que permite reproducir la inferencia con `nnUNetv2_predict_from_modelfolder`.

El eje experimental del trabajo es la aumentación de datos. La configuración A0 no aplica aumentación; A1 usa la aumentación estándar de nnU-Net; A2 aplica perturbación de intensidad por fase de forma independiente; A3 emplea aumentación afín compartida entre fases; y A4 incorpora una aumentación restringida por el orden de las fases (cinética). Cada configuración se entrena en cinco folds, sumando 25 checkpoints finales. El dataset de entrenamiento es MAMA-MIA, distribuido bajo sus propios términos de acceso y citación. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de ajuste posteriores.

## Capacidades

- Segmentación de tumores mamarios en estudios DCE-MRI multicéntricos con entrada de tres fases.
- Producción de máscaras de segmentación volumétrica 3D mediante el pipeline estándar de nnU-Net.
- Reproducción de validación cruzada interna: cada caso debe evaluarse con el fold que le corresponde en la partición original.
- Comparación controlada de cinco esquemas de aumentación (A0 a A4) sobre el mismo dataset.
- Inferencia con metadatos autocontenidos (`plans.json`, `dataset.json`) por directorio experimental.
- Verificación de integridad de los pesos mediante digests SHA-256 (`SHA256SUMS`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión médica.

## Casos de uso

- Investigación en segmentación de cáncer de mama: permite reproducir los resultados de validación cruzada del manuscrito y comparar configuraciones de aumentación sobre MAMA-MIA con un protocolo fijo.
- Estudio del efecto del orden de fases en DCE-MRI: los checkpoints A4 (aumentación restringida por orden de fase) permiten aislar el impacto de la coherencia cinética en la calidad de la segmentación frente a A2 y A3.
- Desarrollo de métodos de aumentación: sirve como línea base reproducible para proponer y evaluar nuevas técnicas de perturbación de intensidad en imágenes médicas multicéntricas.
- Validación de pipelines de nnU-Net: los metadatos y pesos permiten comprobar la integración de entrenadores personalizados (plugin de nnU-Net) en entornos de investigación.
- Análisis de robustez entre centros: al entrenarse sobre MAMA-MIA, los checkpoints permiten estudiar el comportamiento del modelo ante variabilidad de adquisición entre hospitales, aunque la generalización a cohorts externas no está establecida.
- Reproducibilidad y auditoría: la revisión inmutable y los digests SHA-256 facilitan la verificación de artefactos en publicaciones y revisiones por pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (28,3 GB) corresponde a 25 checkpoints, no a un único modelo.
- GPU recomendadas: no disponible. nnU-Net v2 ResEncL en 3D requiere habitualmente GPUs con memoria amplia, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante `nnUNetv2_predict_from_modelfolder` del entorno nnU-Net v2, con los entrenadores personalizados registrados mediante `scripts/install_nnunet_plugin.py`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de mama en DCE-MRI.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el uso clínico no está establecido y la generalización a la cohorte independiente de Yunnan no se ha demostrado.
- Licencia no declarada: no existe una licencia de reutilización separada para los pesos, lo que limita su uso comercial y su redistribución.
- Dependencia de código privado: el código fuente (`v0.1.0-paper`) es privado y requiere invitación, lo que condiciona la reproducibilidad completa.
- Dependencia de datos externos: el dataset MAMA-MIA se rige por sus propios términos de acceso, reutilización y citación.
- Riesgo de fuga en evaluación: las predicciones solo deben agruparse tras preservar la asignación de fold original de cada caso; ignorarlo invalida la validación cruzada.
- Orden de canales obligatorio: la entrada debe respetar el orden precontraste, postcontraste temprano y postcontraste tardío, con los metadatos del mismo directorio.
- Sin información sobre sesgos, alucinación (no aplica a segmentación) ni rendimiento en poblaciones distintas a las del dataset de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harshitrk07/MAMAGuard-Net
- Revisión verificada de pesos: https://huggingface.co/harshitrk07/MAMAGuard-Net/tree/4e8d231c3ad821be90be8b5c30b329a658c26d59
- Código fuente (privado, requiere invitación): https://github.com/kulharshit21/MAMAGuard-Net/tree/v0.1.0-paper
- Dataset MAMA-MIA: https://doi.org/10.7303/syn60868042
