# Cheaho/Llama-3-Ko-8B-kch-gguf

## Resumen

Llama-3-Ko-8B-kch-gguf es una conversión al formato GGUF de un ajuste fino (fine-tuning) del modelo Llama 3 de 8B, publicada por el usuario Cheaho en Hugging Face. El repositorio contiene un único archivo de pesos en cuantización Q8_0 generado con las herramientas de Unsloth, pensado para su uso directo con llama.cpp y sus derivados (llama-cli, llama-mtmd-cli). El nombre del modelo sugiere un ajuste orientado al coreano ("Ko"), aunque la model card no lo confirma explícitamente.

El modelo parte de la arquitectura transformer densa de Llama 3 con 8.030.261.248 parámetros totales, tal y como refleja el dato de safetensors del repositorio. Se distribuye como un GGUF de 8,5 GB en cuantización Q8_0, lo que lo hace ejecutable en entornos de llama.cpp sin necesidad de infraestructura de GPU de datacenter.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye información sobre el dataset de ajuste fino, la licencia, los idiomas soportados ni resultados de evaluación. Se trata de una publicación de bajo perfil (0 descargas, 0 likes en el momento de la consulta) que debe evaluarse como artefacto técnico antes que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible (el nombre sugiere coreano, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 en su variante de 8B: un transformer denso con atención multi-cabeza agrupada (GQA) y tokenizador BPE de la familia Llama 3. El repositorio no documenta ningún cambio estructural respecto al modelo base; el autor indica únicamente que el modelo fue ajustado y convertido a GGUF con Unsloth.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla el método de ajuste (LoRA, QLoRA, full fine-tuning) más allá de la mención genérica a Unsloth. La única innovación documentada es de proceso, no de modelo: el uso de Unsloth para acelerar el ajuste y la conversión a GGUF.

## Capacidades

- Generación de texto autoregresiva propia de un modelo Llama 3 de 8B.
- Conversación multi-turno mediante plantilla de chat (la model card recomienda `--jinja` para aplicar la plantilla correctamente).
- Ejecución local con llama.cpp y compatibilidad con endpoints de tipo OpenAI a través de herramientas derivadas.
- Soporte potencial de tool calling, heredado del modelo base, aunque no verificado en este ajuste concreto.
- Capacidades multilingües: no documentadas; el nombre del modelo sugiere especialización en coreano, pero no hay confirmación en la model card.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Prototipado local de asistentes conversacionales en coreano: el ajuste nominal sugiere uso en diálogo; conviene validar la calidad real antes de desplegar, dado que no hay evaluación publicada.
- Inferencia en CPU o GPU de gama media con llama.cpp: el GGUF Q8_0 de 8,5 GB permite ejecución en estaciones de trabajo sin GPU de datacenter, útil para pruebas offline.
- Evaluación comparativa de ajustes finos de Llama 3: sirve como artefacto de referencia para medir el efecto de un fine-tuning no documentado frente al modelo base.
- Integración en pipelines de generación de texto con API compatible OpenAI: mediante servidores llama.cpp con endpoints compatibles, se puede conectar a aplicaciones existentes.
- Experimentación académica con cuantización Q8_0: útil para estudiar la pérdida de calidad respecto a pesos originales en tareas concretas.
- Generación de texto asistida en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar datos a APIs externas, siempre que la licencia lo permita (no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en Q8_0 (8,5 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 con contexto amplio; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En 8 GB no cabe en Q8_0; requeriría una cuantización menor no publicada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y servidores compatibles con la API de OpenAI basados en llama.cpp.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-Ko-8B-kch-gguf | 8,03B | no disponible | no disponible | GGUF Q8_0 | Hugging Face (0 descargas) |
| Llama 3 8B (base, Meta) | 8,03B | 8.192 tokens (estándar de Llama 3) | Llama 3 Community License | safetensors, GGUF | Amplia, muy extendida |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Amplia, muy extendida |
| Mistral 7B | 7,24B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Amplia, muy extendida |

La comparación con el modelo base es la más relevante: este repositorio no documenta mejoras medibles sobre Llama 3 8B, y su licencia no está declarada, lo que lo sitúa en desventaja frente a alternativas con términos claros.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste fino, lo que impide evaluar sesgos introducidos.
- Licencia no declarada: no se puede asumir uso comercial sin contactar al autor; el modelo base Llama 3 tiene sus propios términos que podrían aplicar.
- Riesgo de alucinación propio de un modelo de 8B, sin evaluación que lo mitigue.
- Idiomas soportados no confirmados; el uso en castellano no está validado.
- Contexto no declarado; no debe asumirse la ventana de 8K o 128K de Llama 3 sin verificación.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de calidad más allá de la model card.
- Única cuantización disponible (Q8_0): no hay opciones Q4 o Q5 para hardware con menos VRAM.
- La fecha de creación indicada (2026) resulta anómala y sugiere posibles inconsistencias en los metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Cheaho/Llama-3-Ko-8B-kch-gguf
- Unsloth (herramienta usada para el ajuste y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado en la model card): https://github.com/ggml-org/llama.cpp
