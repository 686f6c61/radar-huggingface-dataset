# onchainengineer/Qwen3.8-27B-Uncensored-MLX-BF16

## Resumen

El modelo `onchainengineer/Qwen3.8-27B-Uncensored-MLX-BF16` es una conversión completa a formato MLX en precisión BF16 del modelo `orcarouter/Qwen3.8-27B-Uncensored`, un derivado abliterated (eliminación de la dirección de rechazo) de `Qwen/Qwen3.8-27B`. Desarrollado como una conversión comunitaria para Apple Silicon, mantiene todas las capacidades del modelo original: visión-lenguaje, razonamiento con modo de pensamiento, tool calling y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa. Con 27,36 mil millones de parámetros y una ventana de contexto configurada de 262.144 tokens, es un modelo denso de alta capacidad orientado a desarrolladores que necesitan ejecutar un modelo sin restricciones de rechazo en hardware Apple.

La conversión no aplica cuantización, fine-tuning ni modificación de pesos; simplemente adapta los safetensors originales al formato MLX. El repositorio incluye tanto el modelo principal (1.184 tensores BF16) como un drafter MTP separado (15 tensores BF16), totalizando 1.199 tensores. La validación funcional se realizó en un Mac Studio con M3 Ultra de 256 GB de memoria unificada, midiendo un pico de memoria de aproximadamente 55 GB para texto, 55,8 GB para visión y 56,4 GB con MTP activo. No se han publicado resultados de benchmarks formales en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa) |
| Parametros totales | 27.356.728.940 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens configurados |
| Tipos de cuantizacion | BF16 (sin cuantizar); existen variantes cuantizadas 2/4/6/8-bit en repositorios relacionados |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX BF16 (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura de atención híbrida que combina Gated DeltaNet lineal con atención completa, según el repositorio de `onurburak9/Qwen3.8-27B-Uncensored-MLX`. Es un modelo de visión-lenguaje nativo con control de razonamiento (thinking mode), soporte de tool-calling y un cabezal MTP para decodificación especulativa. El modelo `orcarouter/Qwen3.8-27B-Uncensored` aplica una técnica de abliteration que elimina la dirección de rechazo del modelo base, reduciendo el comportamiento de negación ante solicitudes. La metodología de abliteración se describe en el blog de MindStudio, que menciona una técnica de KL-drift y pruebas de rechazo basadas en jueces. Esta conversión MLX no altera los pesos; simplemente los convierte a BF16 sin cuantización. Los datos de entrenamiento y el proceso de abliteración detallado no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto con y sin modo de razonamiento (thinking mode), activable mediante parámetros de generación.
- Soporte de visión-lenguaje (image-text-to-text) para describir imágenes y responder preguntas sobre su contenido.
- Tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Razonamiento multi-step y soporte para agentes, gracias al modo de pensamiento y la arquitectura híbrida.
- Decodificación especulativa nativa con modelo MTP integrado, que acelera la generación de secuencias largas.
- Capacidades conversacionales multi-turno con contexto largo (hasta 262.144 tokens configurados).
- Multilingüismo no confirmado en este repo, pero el modelo base de Qwen soporta varios idiomas.

## Casos de uso

- **Asistente de análisis de imágenes técnicas**: el modelo puede describir imágenes, identificar objetos y colores, y responder preguntas visuales, útil para documentación técnica o análisis de capturas de pantalla.
- **Chatbot de atención al cliente**: con una ventana de contexto de 262.144 tokens, puede gestionar conversaciones largas y multihilo, manteniendo el historial completo sin truncamiento.
- **Generación de código en producción**: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, especialmente en entornos Apple Silicon.
- **Razonamiento matemático y lógico**: activando el modo de pensamiento, el modelo puede resolver problemas paso a paso, útil para tutorías académicas o análisis técnico.
- **Decodificación especulativa para aplicaciones de baja latencia**: el drafter MTP integrado reduce la latencia en generaciones largas, adecuado para chatbots interactivos en Mac.
- **Despliegue en servidores GPU**: aunque este repo es MLX, el mismo modelo abliterated está disponible en versiones FP8 para vLLM (según OrcaRouter), permitiendo servir el modelo en infraestructura NVIDIA con alto throughput.
- **Investigación de comportamientos de rechazo**: al ser un modelo abliterated, sirve para estudiar cómo la eliminación de la dirección de rechazo afecta a la generación de respuestas en tareas sensibles, siempre con las debidas precauciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las pruebas realizadas fueron funcionales (smoke tests) y no una reivindicación de paridad de benchmarks. No hay datos numéricos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- **Memoria unificada**: se recomienda al menos 64 GB de RAM unificada en Apple Silicon, dado que el peso del modelo es de ~55 GB y el uso medido alcanza los 55,0 GB en texto, 55,8 GB en visión y 56,4 GB con MTP.
- **GPU**: exclusivo para Apple Silicon (M3, M3 Pro, M3 Ultra, M4, etc.). No es compatible con GPU NVIDIA directamente en formato MLX; para GPU NVIDIA se requiere la versión FP8 (vLLM) o GGUF (llama.cpp).
- **Despliegue**: se puede ejecutar con `mlx-vlm` (instalable con `uv tool install mlx-vlm --with jinja2`), o mediante versiones cuantizadas GGUF con llama.cpp u Ollama.
- **Latencia y throughput**: no se especifican datos concretos. El MTP drafter mejora la velocidad en generaciones largas, pero puede ser más lento en secuencias muy cortas porque la carga del drafter domina.
- **Espacio en disco**: el repositorio ocupa 55,6 GB en formato BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Descripcion |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27,36 B | 262.144 | Apache-2.0 | safetensors, FP8, GGUF | Modelo base oficial con comportamientos de rechazo intactos. |
| orcarouter/Qwen3.8-27B-Uncensored | 27,36 B | 262.144 | Apache-2.0 | safetensors, FP8 | Derivado abliterated del modelo base, sin rechazo. |
| onchainengineer/Qwen3.8-27B-Uncensored-MLX-BF16 | 27,36 B | 262.144 | Apache-2.0 | MLX BF16 | Conversión MLX del abliterated, para Apple Silicon. |
| onurburak9/Qwen3.8-27B-Uncensored-MLX (2/4/6/8-bit) | 27,36 B | 262.144 | Apache-2.0 | MLX cuantizado | Variantes cuantizadas del mismo modelo para Apple Silicon con menor huella de memoria. |

## Limitaciones y advertencias

- El modelo es **abliterated**, lo que reduce intencionalmente el comportamiento de rechazo. Esto puede producir contenido inapropiado, ofensivo o peligroso. Los usuarios son responsables de evaluar las salidas y cumplir con la ley y la licencia.
- No se ha realizado una evaluación exhaustiva de seguridad ni de rendimiento; la validación se limita a smoke tests funcionales.
- Riesgo de alucinaciones y de generar información falsa, especialmente en tareas de razonamiento o visión.
- La ventana de contexto de 262.144 tokens es el valor configurado, pero la longitud útil real depende de la memoria disponible y de la configuración de KV-cache; en la práctica puede ser menor.
- El soporte de idiomas no está documentado en este repositorio; aunque el modelo base Qwen soporta varios idiomas, no se garantiza el mismo comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad de las salidas y de las aplicaciones en producción.
- No es un modelo oficial de Qwen ni de OrcaRouter; es una conversión comunitaria sin garantías de soporte o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onchainengineer/Qwen3.8-27B-Uncensored-MLX-BF16
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo original abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio GitHub con versiones MLX cuantizadas: https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Repositorio GitHub con GGUF y Ollama: https://github.com/Wassily.../qwen38-uncensored
- Blog sobre la abliteración AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog de OrcaRouter sobre versiones GGUF y FP8: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
