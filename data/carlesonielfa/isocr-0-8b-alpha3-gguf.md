# carlesonielfa/isOCR-0.8B-alpha3-GGUF

## Resumen

isOCR 0.8B alpha3 es un modelo de lenguaje afinado (fine-tune) a partir de Qwen/Qwen3.5-0.8B, desarrollado por Carles Onielfa Pérez (carlesonielfa) para realizar OCR de portapapeles enriquecido dentro de la aplicación isoboard. El modelo está pensado como un componente especializado: recibe contenido visual o textual copiado y devuelve una representación estructurada y rica del mismo, en lugar de limitarse a transcribir caracteres planos. Se distribuye en formato GGUF, lo que facilita su ejecución en entornos locales con llama.cpp y compatible con endpoints de inferencia.

El modelo cuenta con 752.393.024 parámetros totales (aproximadamente 0,75B) y un tamaño de repositorio de 0,9 GB, lo que lo sitúa en la gama de modelos pequeños aptos para ejecución en hardware de consumo. Se trata de la versión alpha3, lo que indica que es una iteración temprana y sujeta a cambios. La información pública disponible es escasa: no se detallan idiomas soportados, pipeline ni resultados de benchmarks.

La relevancia de este modelo radica en su enfoque vertical: no compite como modelo generalista, sino como un componente de OCR especializado con licencia restrictiva (PolyForm Internal Use 1.0.0 con permisos adicionales de uso personal), diseñado para integrarse en un producto concreto. Para desarrolladores que evalúen modelos pequeños de OCR o de procesamiento de documentos, resulta un caso interesante de fine-tune de un modelo base pequeño con un objetivo muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | isocr-internal-use-with-personal-permission (PolyForm Internal Use 1.0.0 con permiso adicional de uso personal y de salidas) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,75B parámetros. La model card indica que se ha afinado específicamente para "rich clipboard OCR" en isoboard, lo que sugiere un entrenamiento orientado a tareas de extracción y estructuración de contenido copiado, probablemente con datos propios del producto. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible se limita a la relación con el modelo base y al propósito del fine-tune. El modelo incluye, según la model card, un "vision projector" asociado, lo que indica que el sistema completo incorpora capacidades de visión para el procesamiento de contenido visual, aunque el repositorio GGUF publicado corresponde al modelo de lenguaje.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- OCR de portapapeles enriquecido: extracción y estructuración de contenido copiado, orientado a la aplicación isoboard.
- Procesamiento de contenido visual mediante un vision projector asociado (según la model card).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- OCR de portapapeles en isoboard: el modelo procesa el contenido copiado por el usuario y devuelve una representación enriquecida y estructurada, que es su función principal declarada.
- Extracción de texto de capturas de pantalla en flujos internos: al estar afinado para OCR, puede integrarse en herramientas internas de digitalización de documentos capturados como imagen.
- Procesamiento local de documentos sensibles: al distribuirse en GGUF y con 0,75B parámetros, puede ejecutarse en local sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de pipelines de OCR en investigación: sirve como punto de partida para evaluar fine-tunes pequeños de Qwen3.5 en tareas de extracción de texto.
- Integración en aplicaciones de escritorio: el formato GGUF y su tamaño (0,9 GB) permiten empaquetarlo en aplicaciones de escritorio con llama.cpp.
- Uso personal o interno en empresas: la licencia permite uso personal y uso interno de negocio sin coste, lo que facilita su adopción en herramientas internas.
- Generación de salidas OCR para trabajos remunerados: la licencia permite usar las salidas ordinarias de OCR en trabajos de pago, sujeto a los derechos sobre el contenido de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 752M parámetros, en cuantización de 4 bits se estima alrededor de 0,5 GB de pesos; en 8 bits, alrededor de 0,8 GB; en FP16, alrededor de 1,5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo en cuantizaciones bajas; GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), y servidores compatibles con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| isOCR 0.8B alpha3 | 752.393.024 | no disponible | PolyForm Internal Use 1.0.0 con permiso adicional | GGUF | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache 2.0 (según la model card) | safetensors y otros | Hugging Face |
| Otros fine-tunes de OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de OCR especializado no está disponible en la información proporcionada. Frente a su modelo base, isOCR añade el ajuste para OCR de portapapeles y una licencia más restrictiva.

## Limitaciones y advertencias

- Es una versión alpha3: se trata de una iteración temprana y su comportamiento puede cambiar en versiones posteriores.
- Información pública muy limitada: no se detallan idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad objetivamente.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no corresponde al contenido de entrada, especialmente en OCR de documentos complejos.
- Licencia restrictiva: la redistribución de los archivos del modelo, incluido su empaquetado en productos entregados a terceros, requiere un acuerdo separado con legal@isoboard.app. El uso comercial como servicio de inferencia orientado a clientes también requiere contacto previo.
- El material upstream de Qwen conserva sus términos Apache 2.0, según la model card.
- La compra de la aplicación isoboard no incluye derechos de redistribución del modelo.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles.
- Para producción: verificar la licencia con el titular antes de cualquier integración orientada a clientes o de redistribución.

## Enlaces

- Hugging Face: https://huggingface.co/carlesonielfa/isOCR-0.8B-alpha3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia completa: LICENSE.md (referenciado en la model card)
- Permiso adicional: ADDITIONAL-PERMISSION.md (referenciado en la model card)
- Términos Apache 2.0 de Qwen: APACHE-2.0-QWEN.txt (referenciado en la model card)
- Aviso de atribución: NOTICE.txt (referenciado en la model card)
