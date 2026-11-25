# ampixa/sanoOCR

## Resumen

sanoOCR es un sistema de reconocimiento óptico de caracteres (OCR) desarrollado por Ampixa, diseñado específicamente para texto impreso y manuscrito en nepalí (devanagari) e inglés. Se distribuye como un conjunto de redes neuronales en formato ONNX con un total de 873.889 parámetros, lo que lo sitúa entre los sistemas OCR más pequeños publicados para escritura devanagari. El modelo se entrena desde cero, sin reutilizar pesos de otros sistemas, y está pensado para ejecutarse íntegramente en CPU sin dependencia de PyTorch ni de GPU.

El sistema se compone de tres elementos: un localizador de líneas, un lector de caracteres y un modelo de lenguaje opcional basado en n-gramas de caracteres (7-gramas, tabla de consulta, no red neuronal). Se publica en dos versiones: v0.1, orientada a texto impreso (escaneos, periódicos, PDFs), y v0.2, que añade soporte para escritura manuscrita, cuadernos y fotografías de móvil manteniendo la calidad de impresión de v0.1. Su relevancia radica en que, con dos órdenes de magnitud menos parámetros que alternativas como GLM-OCR o PaddleOCR-VL, obtiene errores de carácter (CER) notablemente menores en escritura manuscrita devanagari, un dominio donde los modelos grandes tienden a producir script incorrecto o bucles de repetición.

La licencia es propietaria ("internal", marcada como `license: other`), lo que restringe su uso a los términos definidos por el autor. El repositorio ocupa 0,2 GB y la librería declarada es ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (sistema OCR compuesto por localizador de líneas y lector de caracteres en ONNX; LM opcional de 7-gramas) |
| Parámetros totales | 873.889 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa por líneas de texto, no por ventana de contexto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Nepalí (devanagari) e inglés |
| Licencia | Propietaria / interna (`license: other`, `license_name: internal`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El sistema se describe como un pipeline de tres etapas: un localizador de líneas, un lector de caracteres y un modelo de lenguaje opcional de 7-gramas de caracteres (`lm.npz`) que actúa como tabla de consulta, no como red neuronal. El cómputo total de red es inferior a 0,9 M de parámetros y se ejecuta sin PyTorch, únicamente con ONNX en CPU. El autor indica que el modelo se entrena desde cero y que no incluye pesos del modelo Indra. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna de cada subred (tipo de capas, atención, etc.).

Las versiones publicadas son v0.1 (12 de noviembre de 2026), para texto impreso, y v0.2 (13 de noviembre de 2026, candidata), que añade manuscrito y fotografías de móvil. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de texto impreso en nepalí (devanagari) e inglés: escaneos, periódicos y PDFs (a través de su capa de texto).
- Reconocimiento de escritura manuscrita en devanagari e inglés (v0.2), incluyendo cuadernos y fotografías de móvil.
- Procesamiento por líneas de texto mediante localizador de líneas y lector de caracteres.
- Ejecución en CPU sin GPU ni PyTorch, con pesos en ONNX.
- Modelo de lenguaje opcional de 7-gramas de caracteres para corrección o puntuación.
- Soporte de dos idiomas: nepalí e inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o visión general más allá del OCR.

## Casos de uso

- Digitalización de periódicos y publicaciones históricas en nepalí: el modelo puede procesar líneas de texto impreso con un CER del 0,37 % en el conjunto Gorkhapatra, adecuado para pipelines de preservación documental en CPU sin infraestructura GPU.
- Extracción de texto de PDFs escaneados: al combinar el localizador de líneas y el lector, puede recuperar texto de documentos administrativos o académicos en nepalí e inglés, con la ventaja de no requerir GPU.
- Procesamiento de formularios y documentos manuscritos: la versión v0.2 obtiene un CER del 10,25 % en fotografías reales de manuscritos (610 líneas, 27 páginas), lo que la hace viable para digitalización de cuadernos y notas de campo.
- OCR en dispositivos de bajos recursos: con menos de 0,9 M de parámetros y formato ONNX, puede desplegarse en entornos sin GPU, como servidores CPU o dispositivos embebidos, para tareas de digitalización a pequeña escala.
- Anotación asistida de corpus en nepalí: el modelo puede generar transcripciones preliminares de manuscritos devanagari para revisión humana, dado su bajo error relativo frente a modelos grandes en ese dominio.
- Procesamiento de documentos bilingües nepalí-inglés: adecuado para materiales que mezclan ambos idiomas, como textos académicos o administrativos, con la salvedad de que el rendimiento en inglés impreso es inferior al de modelos grandes (CER del 6,05 % frente a 1,24 % de Qwen3-VL-4B).

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan sistemas sobre los mismos ítems y un único scorer (CER % / WER %; menor es mejor):

| Sistema | Parámetros | Devanagari manuscrito, IndicScan (835) | Nepalí manuscrito, h1 (871) | Documentos nepalí reales Sarvam (437) | Documentos inglés reales Sarvam (299) |
|---|---|---|---|---|---|
| sanoOCR v0.2 | 873.889 | 15,4 / 44,4 | 13,6 / 34,8 | 4,71 / 15,2 | 6,05 / 15,7 |
| PP-OCRv5 Devanagari mobile | ~2,0 M (rec) | 25,1 / 64,4 | 40,7 / 81,3 | 11,7 / 39,4 | 3,86 / 9,9 |
| Indra OCR 1.1.2 | 3,61 M | 96,4 / 100,4 | 81,3 / 97,1 | 27,3 / 44,8 | 4,88 / 10,6 |
| Indra OCR 0.3.2 | 2,19 M | 97,0 / 101,4 | 81,0 / 97,8 | 24,8 / 65,6 | 8,54 / 22,0 |
| Tesseract 4.1.1 (nep/hin/eng) | No contabilizado | 83,3 / 122,5 | 80,6 / 104,0 | 4,32 / 11,8 | 4,48 / 11,5 |
| Surya 2 (mejor de 2 modos) | 686 M | 45,2 / 74,9 | 166,1 / 209,4 | No ejecutado | No ejecutado |
| PaddleOCR-VL-1.6 | 906 M | 110,9 / 105,9 | 143,1 / 104,4 | 55,4 / 86,2 | 1,49 / 6,3 |
| GLM-OCR | 1.107 M (cargado) | 124,3 / 133,3 | 137,9 / 134,4 | 104,3 / 128,6 | 1,43 / 6,4 |
| Qwen3-VL-4B-Instruct | 4.438 M | No ejecutado | No ejecutado | 16,05 / 43,2 | 1,24 / 4,2 |

Resultados adicionales de la model card (conjuntos bloqueados, CER/WER):

| Conjunto de prueba | v0.1 CER / WER | v0.2 CER / WER | Indra OCR 0.3.2 |
|---|---|---|---|
| Sarvam documentos nepalí reales (437 bloques) | 4,76 % / 15,5 % | 4,92 % / 16,6 % | 21,59 % / 66,1 % |
| Sarvam documentos inglés reales (299 bloques) | 6,34 % / 16,7 % | 6,23 % | 7,21 % / 20,3 % |
| Gorkhapatra líneas de periódico | 0,37 % | 0,35 % | — |
| Líneas manuscritas (92 escritores no vistos) | 5,28 % | 5,33 % | — |
| Fotografías reales de manuscritos (610 líneas, 27 páginas) | 16,71 % / 61,0 % | 10,25 % / 32,9 % | — |

El autor advierte de que las cifras de Sarvam difieren entre la tabla de conjuntos bloqueados y la comparativa entre sistemas (4,71 % frente a 4,92 % en sanoOCR; 24,84 % frente a 21,59 % en Indra 0.3.2) porque el scorer de la primera tabla no se localizó; recomienda citar la tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema está diseñado para ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; el autor ejecutó sanoOCR en CPU.
- Cabe en GPU de consumo: sí, aunque no es necesario; el modelo es de 0,87 M de parámetros.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER manuscrito IndicScan | CER documentos nepalí Sarvam | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sanoOCR v0.2 | 873.889 | No aplica (por líneas) | 15,4 | 4,71 | Propietaria / interna | Hugging Face (ONNX) |
| Indra OCR 1.1.2 | 3,61 M | No aplica | 96,4 | 27,3 | OpenRAIL-M modificada (cláusula de uso competitivo) | Datalab |
| PP-OCRv5 Devanagari mobile | ~2,0 M (rec) | No aplica | 25,1 | 11,7 | No disponible | PaddleOCR |
| Tesseract 4.1.1 | No contabilizado | No aplica | 83,3 | 4,32 | Apache 2.0 | Código abierto |

sanoOCR destaca por su tamaño reducido (2,5–4 veces menor que Indra OCR) y por un error mucho menor en manuscrito devanagari, aunque en documentos impresos en nepalí Tesseract obtiene un CER ligeramente inferior (4,32 % frente a 4,71 %) y en inglés impreso los modelos grandes de visión-lenguaje son aproximadamente 4 veces mejores.

## Limitaciones y advertencias

- Licencia propietaria ("internal"): el uso comercial está restringido a los términos definidos por el autor; no es una licencia de código abierto.
- Rendimiento inferior en inglés impreso frente a modelos grandes de visión-lenguaje (CER del 6,05 % frente a 1,24–1,49 % de Qwen3-VL-4B y PaddleOCR-VL).
- En documentos impresos en nepalí, Tesseract 4.1.1 obtiene un CER ligeramente mejor (4,32 % frente a 4,71 %).
- Los conjuntos de manuscrito son recortes de una sola palabra; los modelos grandes de visión-lenguaje están diseñados para páginas completas, lo que puede penalizarlos en la comparación.
- El conjunto h1 es dato de práctica de v0.2 y puede solaparse con páginas de entrenamiento; IndicScan es una comparación más limpia.
- En un conjunto plateado de 40 páginas reales de fotos de móvil NHD (referencias no revisadas), sanoOCR obtiene un CER del 29,6 %, frente a 82,9 % de Indra 1.1.2 y 86,2 % de Tesseract.
- No se ha comparado con Chandra OCR 2, Google Cloud Vision ni Azure.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; el autor señala que los modelos grandes tienden a emitir script incorrecto o bucles en devanagari manuscrito, pero no cuantifica ese riesgo para sanoOCR.
- Limitación de idioma: solo nepalí e inglés; no se documenta soporte de otros idiomas.
- Los pesos de Indra y Surya usados en la comparación están bajo licencia OpenRAIL-M modificada con cláusula de uso competitivo; el autor advierte de que debe comprobarse antes de publicar esas cifras.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/sanoOCR
- Repositorio del proyecto y benchmarks: `Ampixa/sanoOCR` → carpeta `bench/` (referenciado en la model card, sin URL directa disponible)
- No se proporcionan enlaces adicionales a papers, blogs, repositorios o demos en la información disponible.
