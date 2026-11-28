# nile-academy/qwen3.5-4b-gguf

## Resumen

nile-academy/qwen3.5-4b-gguf es un repositorio de artefactos en formato GGUF derivado del modelo Qwen/Qwen3.5-4B, desarrollado originalmente por el Qwen Team de Alibaba Cloud. El repositorio lo mantiene Nile Academy como espejo oficial de artefactos o conversión de formato registrada, sin entrenamiento adicional sobre los pesos. Su función principal es ofrecer los pesos del modelo en cuantizaciones listas para su uso con llama.cpp y otros runtimes compatibles con GGUF, además de conservar el checkpoint original en BF16.

El modelo base es un transformer de 4.326.350.848 parámetros según los datos de safetensors del repositorio, aunque la model card cita 4.659.865.088 parámetros completos incluyendo embeddings y modalidades de origen. Se distribuye bajo licencia Apache 2.0 y está orientado a generación de texto conversacional, con soporte declarado para tool calling (evaluado en BFCL-V4).

La relevancia de este repositorio radica en que empaqueta un modelo de aproximadamente 4B parámetros en cuantizaciones GGUF (Q8_0 y BF16) para despliegue en entornos con recursos limitados, manteniendo trazabilidad de la revisión exacta del modelo fuente (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y de las licencias originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parámetros totales | 4.326.350.848 (safetensors); 4.659.865.088 según model card (incluye embeddings y modalidades de origen) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, BF16 (original); la model card menciona Q6_K y Q5_K_M como alternativas de compromiso memoria/precisión, pero solo Q8_0 figura como archivo publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (checkpoint original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer del linaje Qwen3.5. El repositorio no realiza entrenamiento adicional: es un espejo de artefactos o conversión de formato del modelo Qwen/Qwen3.5-4B publicado originalmente el 2026-03-02. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o QAT.

El repositorio conserva el checkpoint original en BF16 bajo el directorio `original/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/`, con un total de 9.319.828.096 bytes en tensores originales, además de un GGUF de referencia en BF16 de 8.665.620.256 bytes (solo texto). La conversión a GGUF se realizó con llama.cpp (identificador de build `4413a19`). No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: evaluado con BFCL-V4 (50,3 %), lo que indica soporte de llamadas a herramientas, aunque con margen de mejora.
- Seguimiento de instrucciones: evaluado con IFEval (89,8 %).
- Razonamiento y conocimiento general: evaluado con MMLU-Pro (79,1 %).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Asistente conversacional en local: el modelo puede gestionar diálogos multi-turno en estaciones de trabajo con GPU de consumo, gracias a su tamaño de ~4B parámetros y a la cuantización Q8_0 de 4,611 GB que reduce los requisitos de memoria frente al BF16.
- Integración en pipelines de agentes con tool calling: el soporte de function calling (BFCL-V4 50,3 %) permite conectarlo a frameworks de agentes para tareas de recuperación de información o ejecución de acciones, siempre con validación de permisos en la aplicación consumidora.
- Prototipado rápido con llama.cpp u Ollama: el formato GGUF y el tamaño contenido permiten desplegar el modelo en portátiles y equipos sin GPU dedicada para pruebas de concepto.
- Generación de texto asistida en aplicaciones de escritorio: la model card menciona rutas de desarrollo en Windows con observaciones de disponibilidad separadas, lo que sugiere su uso en herramientas de escritorio.
- Evaluación comparativa de cuantizaciones: el repositorio incluye Q8_0 y BF16, lo que permite medir la pérdida de calidad entre precisiones en tareas de instrucción, conocimiento, matemáticas, multilingüe/árabe y herramientas, tal como propone la propia model card.
- Filtrado y clasificación de texto en lote: con 4B parámetros y Q8_0, es viable ejecutar inferencia por CPU o CUDA en servidores modestos para tareas de clasificación o resumen, aunque no se han publicado métricas de throughput.

## Benchmarks y rendimiento

Resultados reportados por el publicador del modelo fuente (no son mediciones de Wekala sobre estos archivos cuantizados; protocolos y versiones de tarea no normalizados):

| Benchmark | Puntuación (%) | Modo / ajustes |
|---|---:|---|
| MMLU-Pro | 79,1 | publisher-default; protocolo de la model card del publicador |
| IFEval | 89,8 | publisher-default; protocolo de la model card del publicador |
| BFCL-V4 | 50,3 | publisher-default; protocolo de la model card del publicador |

No se han publicado resultados de benchmarks específicos de las cuantizaciones GGUF de este repositorio en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 4,611 GB en disco; el tamaño del archivo no equivale al uso total de RAM/VRAM, ya que hay que sumar estado de contexto, buffers y margen del driver.
- El GGUF BF16 de referencia ocupa 8.665.620.256 bytes (~8,07 GiB) y no tiene techo de elegibilidad de 8 GB según la model card.
- GPU recomendadas: no disponibles en la información proporcionada. La model card indica que CPU y CUDA son backends de ejecución para el mismo archivo de pesos, no modelos separados.
- ¿Cabe en GPU de consumo? La model card no confirma un ajuste sostenido en 8 GB de VRAM; indica que la operación sostenida en 8 GB requiere perfiles medidos propios y que la cualificación amplia de calidad de cuantización está "not qualified".
- Opciones de despliegue: llama.cpp (build `4413a19` usado en la conversión), runtimes compatibles con GGUF y endpoints compatibles según los tags. No se mencionan vLLM, TGI ni Ollama de forma explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa fiable. Los benchmarks publicados corresponden al modelo fuente y no están normalizados frente a otras familias.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-4b-gguf (este repo) | ~4,33B (safetensors) | no disponible | Apache 2.0 | GGUF + safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cualificación amplia de calidad de cuantización de Wekala está marcada como "not qualified": no se hace ninguna afirmación general de "sin pérdida significativa de calidad".
- Los benchmarks publicados son del modelo fuente y no mediciones de estos archivos cuantizados; no deben tratarse como ranking normalizado entre modelos.
- El ajuste sostenido en 8 GB de VRAM, así como el uso en móvil/navegador, requieren perfiles medidos propios que no se han publicado.
- El tamaño del archivo no equivale al uso total de memoria: hay que añadir estado de contexto, buffers y margen del driver.
- Riesgo de alucinación y de salidas incorrectas o inseguras: la model card advierte explícitamente de que el modelo puede producir resultados erróneos.
- Las llamadas a herramientas son propuestas sujetas a los permisos de la aplicación consumidora y a la admisión del controlador; no deben ejecutarse sin validación.
- Idiomas soportados no declarados; la model card menciona tareas multilingües/árabe como parte de la evaluación pendiente, lo que sugiere que el soporte multilingüe no está cualificado.
- La licencia Apache 2.0 cubre los pesos, pero el repositorio no concede derechos sobre el SDK de Wekala.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nile-academy/qwen3.5-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Model card del modelo base (revisión fijada): https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/README.md
- Fuente del publicador (GitHub QwenLM): https://github.com/QwenLM/Qwen3.8
- Checkpoint original en BF16: https://huggingface.co/nile-academy/qwen3.5-4b-gguf/tree/main/original/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
