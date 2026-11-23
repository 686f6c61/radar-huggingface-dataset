# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF es la distribucion cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft, un ajuste fino del modelo vision-lenguaje LiquidAI/LFM3-VL-2B orientado a tareas de agente de interfaz grafica en telefonos moviles (GUI agent sobre Android). El modelo recibe capturas de pantalla junto con un objetivo en lenguaje natural y produce la siguiente accion a ejecutar sobre la interfaz, lo que lo situa en la categoria de modelos image-text-to-text especializados en automatizacion de dispositivos.

El modelo base es LFM3-VL-2B de Liquid AI, con 1.728.801.600 parametros totales (aproximadamente 1,7 mil millones), lo que lo hace apto para despliegue en hardware modesto. Esta version GGUF incluye el modelo de lenguaje cuantizado a 4 bits (Q4_K_M) y un proyector visual separado en Q8_0, y esta pensada para ejecutarse con llama.cpp y llama-server. El autor indica que estos son exactamente los ficheros sobre los que se ejecutaron las evaluaciones publicadas.

La relevancia del modelo radica en su enfoque: es un modelo de investigacion, de tamano pequeno, disenado especificamente para el bucle percepcion-accion sobre capturas de pantalla de movil, con una ventana de contexto de 8192 tokens en la configuracion de servicio recomendada y un historial de texto limitado a 8 pasos. Su licencia es la LFM Open License v1.0, heredada del modelo base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); modelo de lenguaje base LFM3-VL-2B con proyector visual separado (mmproj) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio recomendada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector visual |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (modelo de lenguaje Q4_K_M + mmproj Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (sft) del modelo vision-lenguaje LiquidAI/LFM3-VL-2B. La arquitectura combina un modelo de lenguaje LFM3-VL-2B con una torre visual y un proyector multimodal. Segun la model card, el ajuste fino no modifico la torre visual: el fichero `mmproj-LFM3-VL-2B-Q8_0.gguf` es identico al del modelo original LiquidAI/LFM3-VL-2B-GGUF. Por tanto, el entrenamiento se concentro en el modelo de lenguaje y en su capacidad de razonar sobre capturas de pantalla y producir acciones de agente.

Los datos de entrenamiento consisten en demostraciones grabadas de interacciones con telefonos moviles; el autor indica explicitamente que el modelo nunca interactuo con un telefono real durante el entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se realizo con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior cuantizacion con `llama-quantize Q4_K_M`; el autor afirma que el mismo procedimiento reproduce el GGUF de forma byte a byte.

## Capacidades

- Razonamiento visual sobre capturas de pantalla de telefonos moviles (una captura por paso).
- Generacion de acciones de agente GUI a partir de un objetivo en lenguaje natural y la pantalla actual.
- Procesamiento de instrucciones en ingles (unico idioma declarado).
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Historial de texto de hasta 8 pasos para el contexto de la tarea.
- Soporte de conversacion multimodal (pipeline image-text-to-text).
- No se documenta soporte de tool calling, function calling ni capacidades de audio en la informacion disponible.
- No se documentan capacidades de codigo o matematicas especificas mas alla del modelo base.

## Casos de uso

- Investigacion en agentes GUI moviles: el modelo sirve como base para experimentar con bucles percepcion-accion sobre capturas de pantalla de Android, usando el harness del repositorio del proyecto para medir tasas de exito por tarea.
- Automatizacion de pruebas de interfaz en entornos controlados: dado un objetivo y una captura de un emulador o dispositivo de test, el modelo propone la siguiente accion, lo que permite generar secuencias de prueba reproducibles sin cuentas reales.
- Evaluacion comparativa de modelos pequenos de agente movil: al ser un GGUF de 1,7 mil millones de parametros ejecutable con llama.cpp, permite medir latencia y precision en hardware modesto frente a otros modelos de la misma categoria.
- Prototipado de asistentes de accesibilidad: el modelo puede razonar sobre la pantalla para describir o sugerir acciones, siempre en entornos de investigacion y sin acceso a datos reales del usuario.
- Docencia y demostraciones de IA multimodal: su tamano reducido y su formato GGUF facilitan ejecutar ejemplos de percepcion visual y toma de decisiones en un portatil o en un servidor pequeno.
- Generacion de datos sinteticos de trayectorias: las acciones propuestas por el modelo pueden usarse como candidatos para construir datasets de demostraciones, que despues se filtran y validan manualmente antes de reentrenar.
- Despliegue local con llama-server: gracias a la configuracion documentada (`-c 8192 --image-max-tokens 1024 -ngl 99`), se puede levantar un endpoint compatible para integrar el modelo en un pipeline de investigacion sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en el repositorio de GitHub (`docs/results.md`), pero no se incluyen cifras numericas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB en total; el modelo de lenguaje en Q4_K_M y el proyector visual en Q8_0 caben holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque no se dispone de una cifra oficial de VRAM pico.
- GPU recomendadas: no disponible de forma oficial; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia poder ejecutarlo con `-ngl 99`, aunque no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, por el tamano del modelo (1,7 mil millones de parametros en Q4_K_M); el modelo base esta pensado para despliegue ligero.
- Opciones de despliegue: llama.cpp y llama-server, con la configuracion documentada: `llama-server -m ...Q4_K_M.gguf --mmproj mmproj-LFM3-VL-2B-Q8_0.gguf -c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF | 1,73 mil millones | 8192 (config. recomendada) | GGUF (Q4_K_M + mmproj Q8_0) | LFM Open License v1.0 | Agente GUI movil (Android) |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible | safetensors / GGUF | LFM Open License v1.0 | Vision-lenguaje general |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft | 1,73 mil millones | no disponible | safetensors (formato del fine-tune) | LFM Open License v1.0 | Agente GUI movil (Android), version sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles; no se declara soporte multilingue.
- Procesa una unica captura de pantalla por paso.
- Memoria limitada a un historial de texto de 8 pasos; no hay memoria mas alla de esa ventana.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede limitar su robustez ante estados de interfaz no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la pantalla o en la eleccion de acciones no disponibles; requiere validacion en produccion.
- Licencia LFM Open License v1.0: es necesario revisar los terminos del fichero LICENSE para uso comercial, ya que la licencia se hereda del modelo base y no se detallan aqui sus restricciones.
- Sin datos publicados de benchmarks en la informacion disponible, por lo que no se puede verificar su rendimiento frente a alternativas.
- El modelo no ha sido evaluado en la informacion disponible para tareas fuera del ambito de agente GUI movil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF
- Modelo base del fine-tune: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft
- Modelo original de Liquid AI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
