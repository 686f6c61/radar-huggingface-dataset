# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.1-GGUF es una compilación en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuación como agente de interfaz gráfica en dispositivos móviles Android. El modelo recibe capturas de pantalla junto con un objetivo en inglés y produce la siguiente acción a ejecutar sobre la interfaz, lo que lo sitúa en la categoría de modelos image-text-to-text especializados en automatización de GUI.

El modelo base LFM3-VL-2B es un modelo vision-language de aproximadamente 1.728 millones de parámetros con una torre de visión y un decodificador de lenguaje; este ajuste concreto no modifica la torre de visión, que se mantiene idéntica a la del modelo original de LiquidAI y se distribuye como proyector multimodal independiente en cuantización Q8_0. La compilación GGUF está pensada para su ejecución con llama.cpp, incluido llama-server, y el autor la publica principalmente para reproducir los resultados de sus evaluaciones.

Es relevante ahora porque los agentes móviles basados en modelos pequeños y desplegables localmente son un área activa de investigación, y este modelo demuestra el flujo completo desde un ajuste fino hasta una cuantización Q4_K_M ejecutable en hardware modesto. No obstante, el propio autor lo marca explícitamente como modelo de desarrollo, no recomendado para uso general y sustituido por la versión LFM3-VL-2B-MobileAgent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (torre de visión + decodificador de lenguaje); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de servicio del autor) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de visión (mmproj) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base LFM3-VL-2B de LiquidAI, un modelo vision-language que combina una torre de visión con un decodificador de lenguaje. El ajuste se realizó sobre demostraciones grabadas de interacción con pantallas de teléfono, con un esquema de un solo paso y una captura de pantalla por paso. Según la model card, el ajuste no tocó la torre de visión: el proyector multimodal distribuido en este repositorio es idéntico al de LiquidAI/LFM3-VL-2B-GGUF y se ofrece en Q8_0.

El proceso de cuantización se realizó con llama.cpp (commit cd959bae9) mediante convert_hf_to_gguf.py a F16 y posterior llama-quantize a Q4_K_M. El autor indica que el mismo procedimiento reproduce byte a byte el GGUF de la versión principal. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo mantiene una memoria limitada a un historial de texto de 8 pasos y no dispone de memoria más allá de ese historial.

## Capacidades

- Generación de acciones de agente a partir de capturas de pantalla y un objetivo en inglés.
- Comprensión de imágenes (screenshot) mediante el proyector multimodal Q8_0.
- Razonamiento de un solo paso sobre la interfaz: identifica el siguiente elemento a tocar o la siguiente acción.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Soporte de conversación multi-turno limitado a un historial de texto de 8 pasos.
- Capacidad de ejecución local en dispositivos móviles gracias a la cuantización Q4_K_M.
- No se documenta soporte de tool calling, function calling, audio ni otros modos especiales en la información disponible.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede recibir capturas de pantalla de una app y proponer la siguiente acción, lo que permite generar scripts de test reproducibles sin intervención manual en cada paso.
- Reproducción de evaluaciones de investigación: al ser la compilación exacta sobre la que se ejecutaron las evaluaciones del autor, sirve para replicar resultados de benchmarks de agentes móviles en llama.cpp.
- Prototipado de agentes GUI en local: con Q4_K_M y un contexto de 8192 tokens, se puede desplegar en un portátil o en un teléfono para experimentar con políticas de actuación sin depender de la nube.
- Investigación sobre razonamiento visual de un solo paso: el formato de una captura por paso y objetivo en inglés facilita estudiar la calidad de las decisiones del agente en tareas acotadas.
- Generación de datos sintéticos de interacción móvil: las acciones propuestas pueden servir como punto de partida para anotar o ampliar datasets de demostraciones.
- Docencia y divulgación: un modelo de 1.7 mil millones de parámetros cuantizado a 4 bits es adecuado para explicar el pipeline completo de un agente multimodal en cursos y talleres.
- Evaluación comparativa de cuantizaciones: permite medir el impacto de Q4_K_M frente a F16 en la precisión de las decisiones del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,3 GB; con Q4_K_M del modelo de lenguaje y Q8_0 del proyector, la huella en memoria es de aproximadamente 1,5-2 GB, dependiendo del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor ejecuta con `-ngl 99` (todas las capas en GPU).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- Despliegue: llama.cpp, concretamente llama-server con `--mmproj` y `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.1-GGUF | 1.728.801.600 | 8192 tokens (config. de servicio) | LFM Open License v1.0 | GGUF (Q4_K_M + mmproj Q8_0) | Modelo de desarrollo, no recomendado; sustituido por LFM3-VL-2B-MobileAgent |
| LFM3-VL-2B-MobileAgent-Dev-WaitRelabel | no disponible | no disponible | LFM Open License v1.0 | safetensors (presumiblemente) | Modelo base del que deriva esta cuantización |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | LFM Open License v1.0 | no disponible | Modelo original de LiquidAI; la torre de visión es idéntica |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | LFM Open License v1.0 | no disponible | Versión recomendada por el autor en lugar de este modelo de desarrollo |

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe dejarse actuar sin supervisión en un teléfono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en inglés; no se documenta soporte multilingüe.
- Una captura de pantalla por paso y sin memoria más allá del historial de texto de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento.
- Riesgo de alucinación en la identificación de elementos de la interfaz no disponible como dato medido, pero plausible dado el tamaño del modelo y la naturaleza de la tarea.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Estado de desarrollo: el autor recomienda usar LFM3-VL-2B-MobileAgent en su lugar; este repositorio se mantiene solo para reproducibilidad.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF
- Modelo base: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel
- Versión recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guía de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
