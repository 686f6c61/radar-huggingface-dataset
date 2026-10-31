# axteam/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es una cuantización en formato GGUF del modelo openbmb/MiniCPM5-2B, publicada por el usuario axteam en HuggingFace. El modelo base es un modelo lingüístico compacto de aproximadamente 2.500 millones de parámetros desarrollado por OpenBMB, y esta versión derivada está pensada para ejecutarse de forma local con llama.cpp, Ollama o LM Studio, sin necesidad de GPU dedicada.

La ficha resuelve un problema práctico muy común: permitir la inferencia de un modelo pequeño en hardware de consumo, ofreciendo dos niveles de cuantización (Q8_0 y Q4_K_M) que equilibran calidad y consumo de memoria. La conversión se ha realizado con el script oficial convert_hf_to_gguf.py de llama.cpp y conserva la plantilla de chat original del modelo base, lo que garantiza compatibilidad con el formato de conversación previsto por OpenBMB.

Su relevancia actual radica en la demanda creciente de modelos ligeros para ejecución en local: con archivos de entre 1,6 y 2,7 GB, puede funcionar en portátiles y equipos de escritorio modestos. El modelo base se publica bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones relevantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer basado en la familia MiniCPM) |
| Parámetros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 8192 tokens con llama-server) |
| Tipos de cuantizacion | Q8_0 (8 bits), Q4_K_M (4 bits k-quant medium) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (derivado de safetensors en el modelo base) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente la conversión GGUF del modelo base openbmb/MiniCPM5-2B, por lo que los detalles de arquitectura y entrenamiento corresponden al modelo original de OpenBMB, no a esta cuantización. La conversión se ha realizado con la herramienta oficial convert_hf_to_gguf.py de llama.cpp, embebiendo la plantilla de chat original (chat_template) para que el formato de conversación se respete al usar llama-server, Ollama o LM Studio.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se ha publicado información en los datos disponibles. El pipeline etiquetado como "conversational" indica que está orientado a generación de texto en formato diálogo. No hay indicios de capacidades multimodales en esta versión.

## Capacidades

- Generación de texto conversacional: el pipeline etiquetado como "conversational" y la plantilla de chat embebida indican que está preparado para diálogos multi-turno.
- Ejecución local con llama.cpp: compatible con llama-server, la CLI de llama.cpp y el formato estándar GGUF.
- Integración con Ollama y LM Studio: puede descargarse y ejecutarse directamente desde ambos gestores mediante los tags de cuantización.
- Servidor de inferencia local: mediante llama-server puede exponerse como API compatible con el ecosistema OpenAI.
- No hay información disponible sobre tool calling, agentes, razonamiento extendido, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Chatbot local y privado: al pesar solo 1,6 GB en Q4_K_M, puede desplegarse en un portátil sin GPU para asistentes conversacionales que no envíen datos a la nube, útil en entornos con requisitos de privacidad.
- Servidor de inferencia en API local: con llama-server y la flag -c 8192 puede montarse un endpoint compatible con OpenAI para prototipar aplicaciones de LLM sin coste de infraestructura cloud.
- Integración en Ollama para desarrolladores: el comando ollama run hf.co/axteam/MiniCPM5-2B-GGUF:Q4_K_M permite incorporar el modelo a flujos de trabajo locales con una sola línea.
- Asistente de escritura y corrección ligero: dada su naturaleza conversacional y su tamaño reducido, es adecuado para tareas de redacción breve, resumen y reformulación con latencias bajas en CPU.
- Pruebas y evaluación de modelos pequeños: útil como modelo base de referencia para benchmarks de cuantización (comparar Q8_0 frente a Q4_K_M en calidad de generación).
- Uso en equipos sin GPU dedicada: la cuantización Q4_K_M cabe en memoria RAM convencional (8 GB), lo que lo hace viable en máquinas de oficina o Raspberry Pi de gama alta, aunque con menor calidad de salida.
- Prototipado de agentes sencillos: mediante la API de llama-server puede conectarse a frameworks de agentes locales, aunque no hay confirmación de soporte nativo de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia:
  - Q4_K_M (1,6 GB): cabe en CPU con 4-8 GB de RAM libres; no requiere GPU.
  - Q8_0 (2,7 GB): recomendable 6-8 GB de RAM libres o una GPU con al menos 4 GB de VRAM para aceleración.
- GPU recomendadas: no disponible de forma explícita; para aceleración vía llama.cpp bastaría una GPU de consumo modesta (por ejemplo, RTX 3060 o superior) o Apple Silicon con memoria unificada.
- Consumer GPU: sí, cabe con holgura en casi cualquier GPU moderna de 6 GB o más en ambas cuantizaciones; en CPU pura también es funcional dada la cuantización 4/8 bits.
- Opciones de despliegue: llama.cpp (llama-server, CLI), Ollama (hf.co/axteam/MiniCPM5-2B-GGUF:Q4_K_M o :Q8_0), LM Studio. No hay menención a vLLM ni TGI (no soportan GGUF de forma nativa para este caso).
- Latencia y throughput: no disponible; al ser un modelo de ~2,5 B parámetros cuantizado, se espera inferencia fluida en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-GGUF | ~2,52 B | GGUF | Q8_0, Q4_K_M | Apache-2.0 | Cuantización comunitaria de MiniCPM5-2B para llama.cpp |
| openbmb/MiniCPM5-2B | ~2,52 B | safetensors | sin cuantizar | Apache-2.0 | Modelo base original de OpenBMB |
| Qwen2.5-1.5B-Instruct-GGUF (comunidad) | ~1,5 B | GGUF | Q4_K_M, Q8_0 entre otras | Apache-2.0 (Qwen) | Alternativa de tamaño similar en el ecosistema GGUF |
| Llama-3.2-3B-Instruct-GGUF (comunidad) | ~3,2 B | GGUF | múltiples niveles | Licencia Llama 3.2 | Alternativa ligeramente mayor, licencia más restrictiva que Apache-2.0 |

Nota: la comparativa se basa en modelos de tamaño y formato equivalentes disponibles públicamente; no hay datos de rendimiento publicados para MiniCPM5-2B-GGUF que permitan comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- No hay información publicada sobre idiomas soportados; el modelo base es de OpenBMB, por lo que probablemente tenga sesgo hacia chino e inglés, pero esto no está confirmado en los datos disponibles.
- No hay benchmarks publicados: no es posible evaluar objetivamente su rendimiento frente a alternativas antes de probarlo.
- La cuantización Q4_K_M implica una pérdida de calidad notable en modelos pequeños, tal como advierte la propia model card; para máxima fidelidad al original conviene usar Q8_0.
- La longitud de contexto no está documentada en esta ficha; el ejemplo de uso sugiere 8192 tokens con llama-server, pero el límite real del modelo base no se indica.
- No hay evidencia de soporte de tool calling, function calling ni capacidades multimodales.
- Riesgo de alucinación: al tratarse de un modelo pequeño (~2,5 B), la fiabilidad factual es limitada; no se recomienda para tareas que exijan precisión factual sin verificación externa.
- Licencia: Apache-2.0 tanto en la cuantización como en el modelo base, sin restricciones para uso comercial, aunque los pesos y el tokenizador originales pertenecen a OpenBMB.
- El repositorio tiene muy poca tracción (110 descargas y 2 likes en el momento de los datos), por lo que conviene verificar la calidad de la conversión antes de usarlo en producción.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/axteam/MiniCPM5-2B-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Herramienta de conversión utilizada: https://github.com/ggerganov/llama.cpp (script convert_hf_to_gguf.py)
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la información disponible.
