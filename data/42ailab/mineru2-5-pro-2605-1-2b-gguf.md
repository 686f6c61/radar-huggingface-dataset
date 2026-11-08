# 42ailab/MinerU2.5-Pro-2605-1.2B-GGUF

## Resumen

MinerU2.5-Pro-2605-1.2B-GGUF es una compilación cuantizada en formato GGUF del modelo multimodal de parsing de documentos MinerU2.5-Pro, desarrollado originalmente por OpenDataLab y publicado bajo licencia Apache-2.0. El repositorio lo mantiene 42ailab, que ha convertido los pesos abiertos del modelo base en dos artefactos ejecutables con llama.cpp: un decodificador de texto de aproximadamente 0,38 GB (cuantización Q4_K_M) y un codificador visual de aproximadamente 1,27 GB. El objetivo es permitir el parsing de documentos de forma totalmente local, sin conexión a la nube, en macOS, Windows y Linux.

El modelo resuelve el problema de la reconstrucción estructurada de documentos: no se limita al reconocimiento óptico de caracteres, sino que restaura tablas, fórmulas matemáticas y el orden de lectura de maquetaciones complejas (multicolumna, texto e imagen mezclados) en contenido editable y copiable. Es relevante para flujos documentales con requisitos de privacidad, como contratos, historiales médicos o material interno, donde subir los originales a un servidor de terceros no es aceptable.

La arquitectura es multimodal de tipo image-text-to-text, con un total de 494.032.768 parámetros según los pesos en safetensors del modelo base (aunque la denominación comercial del modelo base es "1.2B"). El contexto por llamada es de aproximadamente 8192 tokens, suficiente para una página o imagen individual, por lo que los PDF multipágina deben procesarse página a página.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (codificador visual + decodificador de texto); detalles internos del transformer no disponibles |
| Parametros totales | 494.032.768 (pesos safetensors del modelo base); el modelo base se comercializa como "1.2B" |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Aproximadamente 8192 tokens por llamada |
| Tipos de cuantizacion | Q4_K_M (decodificador de texto, ~0,38 GB); codificador visual en GGUF (~1,27 GB) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un sistema multimodal de parsing de documentos que sigue un enfoque de "comprender primero la maquetación global de la página y después leer cada bloque en detalle". Procesa una página y la descompone en contenido estructurado: cuerpo de texto, tablas, fórmulas y orden de lectura. La información disponible no detalla la composición interna del transformer ni el número de capas o dimensiones ocultas, ni el volumen o la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacada por el autor es que la mejora de calidad se atribuye a la ingeniería de datos más que al aumento del número de parámetros: con una denominación de 1.2B, el modelo reporta un 95,72 de puntuación global en OmniDocBench v1.6. Esta compilación GGUF no introduce cambios arquitectónicos; su aportación es la cuantización Q4_K_M del decodificador y la conversión del codificador visual a GGUF, con una verificación de fidelidad sobre 100 imágenes aleatorias de OmniDocBench v1.6 en la que 64 de 100 salidas fueron idénticas carácter por carácter al modelo de precisión completa y 90 de 100 presentaron una diferencia de longitud inferior al 10 %, sin degradación sistemática observada.

## Capacidades

- Reconocimiento de texto en imágenes, escaneos y capturas de PDF.
- Restauración de tablas estructuradas (reportado TEDS de 93,62 en OmniDocBench v1.6).
- Reconocimiento de fórmulas matemáticas (reportado CDM de 97,15 en OmniDocBench v1.6).
- Reconstrucción de maquetación y orden de lectura en documentos multicolumna y con mezcla de texto e imagen.
- Salida de contenido editable y copiable a partir de la imagen de una página.
- Procesamiento totalmente local y sin conexión, con los originales sin salir del dispositivo.
- Soporte de chino e inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización de contratos con requisitos de confidencialidad: el modelo procesa cada página de forma local, de modo que los originales no se envían a ningún servidor externo, y devuelve el texto y las tablas en formato editable para su revisión jurídica.
- Extracción de tablas de informes financieros: gracias al TEDS reportado de 93,62, las tablas de balances y estados de resultados se reconstruyen con estructura, lo que reduce la corrección manual antes de volcarlas a una hoja de cálculo.
- Conversión de artículos científicos a texto estructurado: el modelo reconoce fórmulas (CDM 97,15) y orden de lectura en maquetaciones a dos columnas, lo que facilita la reutilización del contenido en gestores de referencias o bases de conocimiento internas.
- Procesamiento de historiales médicos escaneados: al ejecutarse en local en macOS, Windows o Linux, cumple con políticas de tratamiento de datos sensibles que prohíben el envío a la nube, y restaura el texto para su indexación en un sistema interno.
- Alimentación de pipelines RAG sobre documentación corporativa: el modelo convierte PDF escaneados en texto estructurado página a página, que después se fragmenta e indexa; el límite de 8192 tokens por llamada encaja con el procesamiento página a página que exige este flujo.
- Archivado y migración de documentación heredada: digitalización por lotes de escaneos con maquetaciones mixtas, ejecutada en equipos de sobremesa con llama.cpp, sin coste de API y con la licencia Apache-2.0 permitiendo uso comercial.
- Extracción de contenido de capturas de pantalla o fotografías de documentos en aplicaciones de escritorio: la compilación GGUF se integra mediante llama.cpp en herramientas nativas para macOS, Windows y Linux.

## Benchmarks y rendimiento

Resultados citados del informe oficial de OpenDataLab para la release 2605 sobre OmniDocBench v1.6 (no medidos por 42ailab):

| Benchmark | Resultado |
|---|---|
| OmniDocBench v1.6, puntuación global | 95,72 |
| Restauración de tablas (TEDS) | 93,62 |
| Reconocimiento de fórmulas (CDM) | 97,15 |

Verificación de fidelidad de la cuantización realizada por 42ailab sobre 100 imágenes aleatorias de OmniDocBench v1.6, comparando precisión completa frente a la versión cuantizada con la misma imagen e instrucción:

| Métrica | Resultado |
|---|---|
| Salidas idénticas carácter por carácter | 64 / 100 |
| Diferencia de longitud inferior al 10 % | 90 / 100 |
| Degradación sistemática de calidad | Ninguna |

El informe oficial afirma que el modelo supera a OCR especializados como GLM-OCR y PaddleOCR-VL, así como a modelos multimodales de propósito general de mayor tamaño. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que quedan fuera del propósito del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,65 GB en total para los dos artefactos GGUF (0,38 GB del decodificador Q4_K_M más 1,27 GB del codificador visual), más el overhead de la memoria KV y del runtime de llama.cpp.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de VRAM efectiva; también puede ejecutarse en CPU.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el tamaño, una RTX 3060 de 12 GB o superior deja margen amplio, y tarjetas de gama de entrada con 4-6 GB son suficientes.
- Plataformas soportadas: macOS, Windows y Linux.
- Opciones de despliegue: llama.cpp (soporte explícito en la model card); el ecosistema GGUF permite también otros runners compatibles, aunque no se listan explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OmniDocBench v1.6 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B (este, GGUF) | 494 M (pesos safetensors); comercializado como 1.2B | ~8192 tokens | 95,72 (reportado) | Apache-2.0 | Hugging Face y ModelScope |
| GLM-OCR | No disponible | No disponible | Inferior según el informe oficial | No disponible | No disponible |
| PaddleOCR-VL | No disponible | No disponible | Inferior según el informe oficial | No disponible | No disponible |

El informe oficial de OpenDataLab sitúa a MinerU2.5-Pro por encima de GLM-OCR y PaddleOCR-VL en OmniDocBench v1.6, pero la información disponible no incluye las cifras concretas ni las especificaciones de esos modelos comparables.

## Limitaciones y advertencias

- Procesa una página o imagen por llamada: el contexto de aproximadamente 8192 tokens obliga a dividir los PDF multipágina y procesarlos página a página.
- Está diseñado para parsing de documentos estructurados, no para extracción ocasional de texto suelto; para ese uso, un OCR generalista más ligero resulta más ágil.
- El codificador visual es obligatorio: el decodificador de texto por sí solo no es funcional y ambos artefactos se descargan juntos.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- La cuantización introduce fluctuaciones a nivel de carácter en formas de ancho completo y medio y en espaciados; no se observó degradación sistemática, pero no hay garantía de salida idéntica al modelo de precisión completa.
- Riesgo de alucinación en el reconocimiento de contenido: no se documentan tasas de error específicas ni mecanismos de mitigación en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial; debe conservarse el aviso de licencia y la atribución correspondiente.
- Esta compilación no es un modelo nuevo: la capacidad de parsing pertenece a OpenDataLab y 42ailab solo ha realizado la conversión a GGUF y su verificación.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/42ailab/MinerU2.5-Pro-2605-1.2B-GGUF
- README del repositorio: https://huggingface.co/42ailab/MinerU2.5-Pro-2605-1.2B-GGUF/blob/main/README.md
- Árbol de archivos: https://huggingface.co/42ailab/MinerU2.5-Pro-2605-1.2B-GGUF/tree/main
- Modelo base en Hugging Face: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Réplica en ModelScope: https://modelscope.cn/models/42ailab/MinerU2.5-Pro-2605-1.2B-GGUF
- Informe técnico (arXiv): https://arxiv.org/abs/2604.04771
- Sitio de 42ailab: https://42ailab.com
- Sitio de 42model: https://42model.com
