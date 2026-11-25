# Daemons-Q/qsh-medical-lidc-nodule3d-ckks-square-student

## Resumen

El modelo `qsh-medical-lidc-nodule3d-ckks-square-student` es una red neuronal convolucional 3D de muy pequeño tamaño (22.066 parámetros) desarrollada por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación cuánticamente segura. Su propósito es clasificar nódulos pulmonares (maligno frente a benigno) a partir de recortes de tomografía computarizada torácica de 28 mm cúbicos a resolución de 1 mm, y está diseñada específicamente para ser evaluada de extremo a extremo bajo cifrado homomórfico CKKS sin descifrar ninguna capa intermedia.

La relevancia del modelo reside en su planteamiento de privacidad: el cliente cifra los 27 taps de convolución de un recorte, el evaluador aplica convolución, elevación al cuadrado y la capa densa directamente sobre los cifrados, y el cliente descifra únicamente dos logits. Esto lo convierte en una pieza demostrativa de inferencia sobre datos médicos sin exponerlos en claro al servidor de cómputo. La arquitectura es deliberadamente mínima para mantener la profundidad multiplicativa en 3, requisito para encajar en los parámetros CKKS declarados.

Se trata de un artefacto de investigación y demostración, no de un sistema clínico. El propio autor lo etiqueta como prueba de concepto, con métricas medidas sobre una partición concreta de LIDC-IDRI y sin comparación directa contra baselines en esa misma partición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D (1 bloque convolucional, activación cuadrática x^2, avg-pool 2x2x2, capa densa) |
| Parametros totales | 22.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen 28x28x28 vóxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | CC-BY-3.0 |
| Formato de pesos | no disponible en la información proporcionada |

## Arquitectura y entrenamiento

La red consta de un único bloque convolucional (1 a 4 canales, kernel 3x3x3, batch norm plegada), seguido de una activación cuadrática x^2, un average pooling 2x2x2 y una capa densa de 4·14^3 a 2 salidas. La entrada es un cubo de 28x28x28 vóxeles (28 mm a 1 mm de resolución). La elección de la activación cuadrática, en lugar de ReLU, responde a la necesidad de mantener una profundidad multiplicativa de 3 bajo CKKS, compatible con los conjuntos de parámetros A2 (N=8192, 48+34+34+34+52 bits) y B (N=16384, 60+40+40+40+60 bits), ambos dentro del límite post-cuántico de 128 bits del estándar HomomorphicEncryption.org.

El entrenamiento emplea destilación con etiquetas suaves desde el mejor de tres candidatos docentes puntuados fuera de pliegue sobre los pacientes de entrenamiento: un ResNet-18 3D entrenado desde cero (AUC 0,874), el tamaño de nódulo de TotalSegmentator (0,786) y una sonda lineal de CT-FM (0,641). El docente seleccionado fue el ResNet-18, que no se publica. Los datos provienen de LIDC-IDRI (TCIA), con 883 series de TC de 875 pacientes que contienen al menos un conglomerado de nódulos (215.912 archivos), verificados contra MD5 e recuento de imágenes de TCIA. Se extrajo un recorte de 28 mm por conglomerado de pylidc, con etiqueta basada en la mediana de malignidad de los radiólogos (mayor que 3 maligno, menor que 3 benigno, exactamente 3 excluido). La partición es por paciente y se fijó antes de descargar imagen alguna. Se pre-registraron cinco semillas y criterios de comparación frente a una variante con ReLU.

## Capacidades

- Clasificación binaria de nódulos pulmonares (maligno frente a benigno) a partir de recortes de TC 3D de 28x28x28 vóxeles.
- Inferencia sobre datos cifrados de extremo a extremo bajo CKKS, sin descifrado de capas intermedias.
- Evaluación en navegador dentro de un Web Worker sobre recortes de prueba incluidos en el sitio de demostración.
- Compatibilidad con dos conjuntos de parámetros CKKS (A2 y B) dentro del límite post-cuántico de 128 bits.
- No dispone de tool calling, capacidades de agente, generación de texto, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento, visión general, audio ni otras modalidades fuera de la imagen volumétrica.

## Casos de uso

- Demostración de inferencia médica con privacidad preservada: el modelo permite mostrar un flujo completo en el que un cliente cifra un recorte de TC, un evaluador no confiable aplica la red sobre el cifrado y el cliente descifra solo dos logits, ilustrando el patrón de computación segura sobre datos sanitarios.
- Investigación en cifrado homomórfico aplicado a imagen médica: sirve como banco de pruebas reproducible para medir la fidelidad de logits descifrados frente a logits en claro (diferencias de 3,2e-5 en A2 y 1,6e-5 en B) y validar decisiones de clasificación sin cambios.
- Evaluación educativa de arquitecturas mínimas compatibles con CKKS: su reducido tamaño (22.066 parámetros) y profundidad multiplicativa 3 lo hacen adecuado para cursos y tutoriales sobre diseño de redes adaptadas a cifrado homomórfico.
- Prueba de concepto en federated learning médico: al formar parte del caso de uso `medical_fl`, puede integrarse en demostraciones de orquestación cuánticamente segura con agregación de modelos entre participantes.
- Validación de pipelines de preprocesado de LIDC-IDRI: el modelo y sus scripts permiten verificar extracción de recortes de 28 mm, etiquetado por mediana de malignidad y partición por paciente antes de escalar a arquitecturas mayores.
- Demostración web interactiva: el sitio del proyecto lo ejecuta en un Web Worker sobre doce recortes de prueba, mostrando cada recorte como tres planos ortogonales, lo que sirve para comunicar conceptos de privacidad a audiencias no técnicas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC (test) | 0,892568 |
| AUC IC95 % bajo | 0,847758 |
| AUC IC95 % alto | 0,933242 |
| Balanced accuracy | 0,846003 |
| AUC de validación | 0,838577 |
| Tasa de clase mayoritaria | 0,685879 |
| n de evaluación | 347 |
| Remuestreos bootstrap | 2000 |
| Semilla exportada | 5 |

El autor cita como contexto, sin comparación directa, los AUC de test de la partición oficial de NoduleMNIST3D (MedMNIST v2, Yang et al., Scientific Data 10:41, 2023): ResNet-18 3D 0,863, ResNet-50 3D 0,875 y auto-sklearn 0,914. Esa partición comparte escáneres entre sus partes y etiqueta de forma distinta, por lo que no se compara. En la comparación pre-registrada de cinco semillas, la variante cuadrática obtuvo AUC de test 0,907 (sd 0,009) frente a 0,882 (sd 0,027) de la misma red con ReLU; la semilla exportada, la 5, elegida por AUC de validación, puntúa 0,893 en test, la más baja de las cinco semillas cuadráticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 22.066 parámetros y entrada de 28x28x28, el modelo en claro ocupa del orden de decenas de kilobytes, pero la evaluación CKKS requiere los parámetros polinomiales (N=8192 o N=16384) y sus cadenas de módulos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo en claro es trivial, pero el coste dominante es el cifrado homomórfico, no la red.
- Opciones de despliegue: evaluación bajo CKKS mediante node-seal (módulo del sitio del proyecto); ejecución en navegador dentro de un Web Worker; los scripts de entrenamiento están en `scripts/train/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AUC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-medical-lidc-nodule3d-ckks-square-student | 22.066 | 28x28x28 vóxeles | 0,893 (partición propia) | CC-BY-3.0 | Hugging Face |
| ResNet-18 3D (referencia MedMNIST v2) | no disponible | volumétrica | 0,863 (partición oficial NoduleMNIST3D) | no disponible | referencia bibliográfica |
| ResNet-50 3D (referencia MedMNIST v2) | no disponible | volumétrica | 0,875 (partición oficial NoduleMNIST3D) | no disponible | referencia bibliográfica |
| auto-sklearn (referencia MedMNIST v2) | no disponible | volumétrica | 0,914 (partición oficial NoduleMNIST3D) | no disponible | referencia bibliográfica |

Las cifras de las alternativas proceden de la literatura citada y no son directamente comparables: la partición oficial de NoduleMNIST3D comparte escáneres entre sus partes y usa un etiquetado distinto, según advierte el propio autor.

## Limitaciones y advertencias

- Modelo de investigación y demostración; no apto para uso clínico ni para toma de decisiones diagnósticas.
- Las etiquetas son la mediana de malignidad de los radiólogos, no un diagnóstico confirmado.
- El docente que generó las etiquetas suaves (ResNet-18 3D) no se publica, lo que limita la reproducibilidad completa del proceso de destilación.
- No existe baseline medido en la misma partición; las comparaciones con MedMNIST v2 son solo contextuales.
- La semilla exportada (5) es la de menor AUC de test entre las cinco semillas cuadráticas pre-registradas (0,893 frente a una media de 0,907).
- El conjunto de evaluación es pequeño (347 nódulos de 148 pacientes), con intervalos de confianza amplios (0,848 a 0,933).
- La activación cuadrática y la arquitectura mínima limitan la capacidad de representación frente a redes mayores; la ventaja medida sobre ReLU es modesta y con solapamiento de intervalos entre semillas.
- No se dispone de información sobre sesgos demográficos, de adquisición o de centro en los datos de LIDC-IDRI más allá de lo declarado.
- Licencia CC-BY-3.0: permite uso comercial con atribución, pero debe respetarse la atribución a LIDC-IDRI, TCIA, Armato et al. y el reconocimiento al NCI y la FNIH indicados en la model card.
- La fidelidad bajo CKKS se midió con los conjuntos de parámetros A2 y B; otros parámetros pueden degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-medical-lidc-nodule3d-ckks-square-student
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset LIDC-IDRI (TCIA): https://www.cancerimagingarchive.net/collection/lidc-idri/
- DOI de LIDC-IDRI: doi:10.7937/K9/TCIA.2015.LO9QL9SX
- Publicación LIDC/IDRI (Armato et al., Medical Physics 38(2), 915-931, 2011): doi:10.1118/1.3528204
- pylidc (Hancock y Magnan, Journal of Medical Imaging 3(4), 044504, 2016): doi:10.1117/1.JMI.3.4.044504
- MedMNIST v2 (Yang et al., Scientific Data 10:41, 2023): doi:10.1038/s41597-022-01721-8
- Estándar HomomorphicEncryption.org: https://homomorphicencryption.org/
