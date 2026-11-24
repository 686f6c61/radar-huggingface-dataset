# maram0/marvel-rivals-cheats-esp-aimbot

## Resumen

El repositorio `maram0/marvel-rivals-cheats-esp-aimbot` no contiene un modelo de inteligencia artificial. Se trata de un repositorio de Hugging Face que distribuye un supuesto paquete ejecutable para Windows de 64 bits (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip`, 4,8 MB) presentado como una herramienta de trampas para el videojuego Marvel Rivals, con módulos de ESP (detección de entidades a través de paredes), aimbot, teletransporte de coordenadas y automatización de farmeo.

La model card no describe arquitectura de red neuronal, parámetros, tokenizador ni pesos en formato safetensors o GGUF. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`YokoCastro3813`, `emanuelefontana2293`) y el archivo se entrega comprimido con contraseña (`2026`), un patrón habitual en la distribución de software potencialmente malicioso o no verificado.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no hay información técnica que lo respalde. Se documenta lo que el autor declara en la model card y se advierte de los riesgos de seguridad asociados a la ejecución de binarios de procedencia desconocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, datos de entrenamiento, proceso de alineación (RLHF, DPO) ni innovaciones técnicas. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma de red neuronal, ni aporta número de tokens de entrenamiento o composición del dataset.

El contenido del README se limita a instrucciones de instalación de un binario (descarga del ZIP, extracción con contraseña `2026`, ejecución como administrador) y a la descripción de supuestas funciones de trampa para un videojuego. No existe relación documentada entre este repositorio y un modelo de lenguaje o multimodal.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código o matemáticas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El autor atribuye al ejecutable funciones de ESP 3D (visualización de entidades y cofres a través de paredes), aimbot, teletransporte de coordenadas, alertas por webhook de Discord, bucle de farmeo automatizado y guardia anti-AFK. Estas afirmaciones no son verificables y no constituyen capacidades de un modelo de IA.
- No se documentan capacidades multilingües reales; los idiomas listados son etiquetas del repositorio.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. El artefacto se presenta como software de trampas para un videojuego, lo que conlleva:

- Riesgo de violación de los términos de servicio de Marvel Rivals y posible suspensión de cuentas.
- Ejecución de un binario de origen no verificado con privilegios de administrador, lo que expone al sistema a malware, robo de credenciales o persistencia no deseada.
- Distribución mediante enlaces a repositorios de GitHub de terceros sin cadena de custodia ni firma de código.
- Uso de contraseña fija en el archivo comprimido, táctica frecuente para evadir análisis automatizados de antivirus.
- Ausencia de cualquier aplicación en desarrollo de software, investigación o procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (valoración 4,8/5, 897K descargas, consistencia del 99,5 % o 96,9 %, polling de 475 Hz) son afirmaciones de marketing sin metodología ni evidencia reproducible, y no corresponden a métricas de evaluación de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisito declarado por el autor: Windows de 64 bits (Windows 11 mencionado en las etiquetas), procesadores Intel o AMD x64, y ejecución como administrador.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que el artefacto no es un modelo. Tampoco se han identificado alternativas legítimas que merezcan una comparación técnica de parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con criterios de parámetros, contexto, benchmarks o licencia de pesos.
- La licencia MIT declarada en los metadatos no aclara la titularidad del binario ni de los recursos que distribuye; el uso comercial queda en un terreno jurídicamente ambiguo.
- El binario se distribuye comprimido con contraseña y alojado en repositorios de GitHub de terceros, lo que impide verificar su integridad y favorece la evasión de análisis de seguridad.
- La ejecución como administrador de un ejecutable no firmado supone un riesgo elevado de compromiso del sistema.
- Las funcionalidades anunciadas (ESP, aimbot, teletransporte) infringen previsiblemente los términos de servicio del videojuego y pueden conllevar el bloqueo de cuentas.
- No hay evidencia de auditoría, código fuente ni reproducibilidad; las métricas de la model card no son verificables.
- No debe desplegarse en entornos de producción ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maram0/marvel-rivals-cheats-esp-aimbot
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/emanuelefontana2293/marvel-rivals-cheats-esp-aimbot/releases/latest
- Paper, blog o demo oficial: no disponible
