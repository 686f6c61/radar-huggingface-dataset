# mradermacher/ultravox-v0_6-qwen-3-32b-arabic-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del proyector multimodal (mmproj) del modelo Ultravox v0.6 con Qwen 3 32B adaptado al árabe. Ultravox es un modelo de voz multimodal que combina un LLM preentrenado (en este caso Qwen 3 32B) con un codificador de voz whisper-large-v3-turbo. La versión cuantizada, creada por mradermacher, ofrece únicamente el proyector en formato GGUF, no el LLM completo. Está pensada para ser utilizada junto con un LLM GGUF en aplicaciones de voz en tiempo real, especialmente en árabe dialectal. El modelo base es ISTNetworks/ultravox-v0_6-qwen-3-32b-arabic, y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal de Ultravox (Speech LLM) con LLM base Qwen 3 32B y codificador whisper-large-v3-turbo |
| Parametros totales | 689.410.048 (según safetensors, corresponde al proyector multimodal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 y f16 (para el mmproj) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (solo mmproj) |

## Arquitectura y entrenamiento

Ultravox es un modelo Speech LLM que integra un LLM base (Qwen 3 32B) con un codificador de voz whisper-large-v3-turbo. El proyector multimodal (mmproj) es el componente que alinea las representaciones de audio con el espacio de embeddings del LLM, permitiendo que el modelo procese entrada de voz y texto. El modelo base ha sido adaptado para arabe dialectal, aunque no se proporcionan detalles sobre el proceso de adaptacion o el entrenamiento. Este repositorio contiene solo el proyector cuantizado, no el LLM completo, por lo que para un despliegue funcional se requiere descargar el LLM base por separado.

## Capacidades

- Procesamiento de entrada de audio (voz) y texto, con salida de texto.
- Soporte multilingue para arabe (incluido dialectal) e ingles.
- Disenado para interacciones de voz en tiempo real, aprovechando la arquitectura Ultravox.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de voz en arabe dialectal: el proyector se integra con un LLM GGUF (por ejemplo, Qwen 3 32B) para construir un asistente que responda a comandos de voz en tiempo real, adecuado para entornos con recursos limitados.
- Atencion al cliente automatizada: permite gestionar consultas de voz en arabe, con respuestas generadas por el LLM, reduciendo la latencia gracias a la cuantizacion del proyector.
- Transcripcion y respuesta en tiempo real: combina el reconocimiento de voz (via whisper) con la generacion de texto del LLM, util para aplicaciones de dictado o subtitulado interactivo.
- Sistemas de traduccion de voz a texto con respuesta: el modelo puede recibir audio en arabe y producir respuestas en texto, facilitando aplicaciones de interpretacion basica.
- Prototipos de interfaces de voz para IoT: al ser un proyector ligero, puede desplegarse en dispositivos con poca memoria junto a un LLM cuantizado.
- Investigacion en procesamiento de voz arabe: sirve como base para experimentos con modelos de voz en arabe dialectal, gracias a su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El proyector multimodal en Q8_0 ocupa 0.8 GB y en f16 1.5 GB, por lo que su inferencia es ligera y puede ejecutarse en CPU o GPU de baja gama.
- Para el LLM base (Qwen 3 32B) se requiere una GPU con al menos 20 GB de VRAM en cuantizaciones bajas (por ejemplo, Q4_K_M), como una RTX 4090 o A100.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros motores que soporten GGUF. Para el LLM completo se recomienda vLLM o TGI si se busca alto rendimiento.
- No se dispone de datos de latencia o throughput especificos para este proyector.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio contiene solo el proyector multimodal, no el LLM completo. Para un uso funcional es necesario descargar el LLM base (ISTNetworks/ultravox-v0_6-qwen-3-32b-arabic) por separado.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo.
- La adaptacion al arabe dialectal puede no cubrir todas las variantes regionales; se recomienda evaluar en el dominio especifico.
- La licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento de las licencias de los componentes base (Qwen 3, whisper).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ultravox-v0_6-qwen-3-32b-arabic-GGUF
- Modelo base: https://huggingface.co/ISTNetworks/ultravox-v0_6-qwen-3-32b-arabic
- Modelo original Ultravox: https://huggingface.co/fixie-ai/ultravox-v0_6-qwen-3-32b
- GitHub de Ultravox: https://github.com/fixie-ai/ultravox
- Pagina de Ultravox: https://ultravox.ai
