# experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly-GGUF

## Resumen

Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly-GGUF es una compilación en formato GGUF del modelo experimental Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly, desarrollado por ExperimentalMachines. Se trata de un modelo multimodal de tipo image-text-to-text afinado específicamente para actuar como agente de control de interfaz gráfica en dispositivos Android: recibe capturas de pantalla y objetivos en lenguaje natural, y produce acciones sobre la pantalla. El modelo parte de la base Qwen/Qwen3.5-0.8B y hereda su licencia Apache-2.0.

El repositorio contiene dos artefactos: el modelo de lenguaje cuantizado en Q4_K_M y un proyector de visión en F16 (`mmproj`), ambos generados con llama.cpp en el commit `cd959bae9`. El tamaño total del repositorio es de aproximadamente 0,7 GB, con 752.393.024 parámetros en los pesos originales en safetensors, lo que lo sitúa en la franja de modelos sub-1B desplegables en hardware muy modesto e incluso en dispositivos móviles.

Es relevante ahora porque ejemplifica la tendencia de agentes GUI ligeros ejecutables localmente, pero el propio autor lo marca explícitamente como checkpoint de desarrollo conservado únicamente para reproducibilidad, no recomendado para uso, y remite a LFM3-VL-2B-MobileAgent como alternativa. La ficha, por tanto, debe leerse con esa advertencia presente en todo momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector de visión); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de servicio con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; F16 para el proyector de visión |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo de lenguaje Q4_K_M y `mmproj` F16); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-0.8B, un transformer de menos de mil millones de parámetros, al que se añade un proyector de visión para procesar capturas de pantalla. La pipeline declarada es image-text-to-text, con entrada de una sola captura por paso y un historial de texto limitado a ocho pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Según la model card, el ajuste se realizó exclusivamente sobre demostraciones grabadas: el modelo nunca interactuó con un teléfono real durante el entrenamiento. Esta característica condiciona fuertemente su comportamiento en producción, ya que puede presentar una brecha entre la distribución de las demostraciones y la variabilidad de un dispositivo en uso real. La versión GGUF se generó con llama.cpp y está pensada para ejecutarse mediante `llama-server` con el binario `mmproj` correspondiente.

## Capacidades

- Generación de acciones de control de interfaz a partir de capturas de pantalla y objetivos en lenguaje natural.
- Comprensión de imágenes (screenshots) mediante el proyector de visión en F16.
- Razonamiento de un solo paso: una captura por paso, sin memoria más allá de un historial de texto de ocho pasos.
- Seguimiento de objetivos formulados en inglés.
- Integración con llama.cpp mediante `llama-server`, permitiendo despliegue local y endpoints compatibles.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso autónomos, audio ni modo de pensamiento explícito.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede recibir capturas de la app bajo prueba y proponer la siguiente acción (toque, deslizamiento, entrada de texto), integrándose en un arnés de pruebas que valide cada paso antes de ejecutarlo.
- Reproducción de flujos de usuario grabados: dado un objetivo en inglés y capturas sucesivas, permite replicar recorridos de navegación en entornos de desarrollo o emuladores para comparar versiones de una aplicación.
- Investigación en agentes GUI: sirve como baseline ligero para experimentos académicos sobre planificación visual y control de dispositivos, con la ventaja de caber en hardware de consumo.
- Prototipado de asistentes de accesibilidad: en un entorno controlado, podría sugerir acciones sobre la pantalla a usuarios con dificultades motoras, siempre con confirmación humana y sin acceso a cuentas reales.
- Evaluación de modelos multimodales pequeños: útil para medir el rendimiento de un modelo sub-1B en tareas de grounding visual y control de UI frente a alternativas mayores.
- Educación y demos: permite mostrar en talleres y charlas cómo se construye un agente móvil local con llama.cpp, sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa aproximadamente 0,7 GB; con Q4_K_M para el modelo de lenguaje y F16 para el proyector de visión, la inferencia cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU modernas; el tamaño reducido lo hace apto para dispositivos móviles de gama alta.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`; no se documentan integraciones con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly-GGUF | 752.393.024 | 8192 | en | apache-2.0 | GGUF en Hugging Face |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | no disponible | no disponible | Hugging Face (recomendado por el autor) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | apache-2.0 | Hugging Face |

El autor recomienda explícitamente LFM3-VL-2B-MobileAgent en lugar de este checkpoint. No se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- Checkpoint de desarrollo: el autor lo marca como no recomendado y lo conserva solo para reproducibilidad de resultados.
- Modelo de investigación: no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Idiomas: solo se ha entrenado y evaluado en inglés; los objetivos en otros idiomas no están soportados.
- Memoria limitada: una captura por paso y un historial de texto de ocho pasos, sin memoria a largo plazo.
- Entrenado solo con demostraciones grabadas: nunca interactuó con un dispositivo real durante el entrenamiento, lo que puede provocar fallos ante variaciones de la interfaz.
- Riesgo de alucinación en la predicción de acciones: puede proponer toques o entradas incorrectas sobre elementos de la pantalla.
- Licencia Apache-2.0 heredada de Qwen/Qwen3.5-0.8B, que permite uso comercial, pero el estado de desarrollo desaconseja su uso en producción.
- No se documentan sesgos específicos; al ser un modelo ajustado sobre demostraciones, puede reproducir sesgos presentes en dichos datos.

## Enlaces

- [Hugging Face: experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly-GGUF](https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly-GGUF)
- [Modelo base: experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly](https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly)
- [Alternativa recomendada: experimentalmachines/LFM3-VL-2B-MobileAgent](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent)
- [Modelo original: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Repositorio del proyecto: experimentalmachines/lfm3-mobile-agent](https://github.com/experimentalmachines/lfm3-mobile-agent)
- [Guía de nombres](https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md)
- [Documentación de modelos](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md)
- [Resultados](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md)
