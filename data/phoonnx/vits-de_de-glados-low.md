# Phoonnx/vits-de_de-glados-low

## Resumen

`vits-de_de-glados-low` es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado por Phoonnx para su librería ONNX `phoonnx`. El modelo original procede del proyecto `systemofapwne/piper-de-glados`, una adaptación de la voz GLaDOS (el personaje de Portal) sobre el motor Piper, y se distribuye aquí en formato ONNX listo para inferencia con la librería de Phoonnx y el ecosistema OVOS.

Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un codificador de texto, un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador adversarial durante el entrenamiento. El modelo es de tamaño reducido (repo de 0,1 GB, variante "low" de calidad) y está orientado a síntesis de voz en tiempo real o en dispositivos con recursos limitados.

La relevancia actual del modelo es acotada: se trata de un empaquetado de una voz comunitaria concreta (GLaDOS) para el ecosistema OVOS/Phoonnx, no de un modelo de propósito general. Su utilidad principal es la integración en asistentes de voz open source que usen el plugin `ovos-tts-plugin-phoonnx`, con licencia MIT y soporte exclusivo para alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decodificador HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" de calidad) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS end-to-end que modela la distribución condicional del audio dado el texto mediante inferencia variacional y entrenamiento adversarial. VITS incorpora un codificador de texto, un prior sobre variables latentes con normalizing flows, un decodificador de audio (típicamente basado en HiFi-GAN) y un discriminador que se usa solo durante el entrenamiento para mejorar la calidad del audio generado. Esta arquitectura permite síntesis rápida en inferencia al no requerir un modelo acústico y un vocoder separados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino. El modelo procede del repositorio `systemofapwne/piper-de-glados`, que a su vez deriva del ecosistema Piper; la variante "low" indica una configuración de menor calidad o menor tamaño orientada a eficiencia. La entrada de texto se convierte a fonemas espeak en alfabeto IPA mediante la librería `scriptconv`, y el modelo se ejecuta vía ONNX Runtime a través de `phoonnx`.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán (`de-DE`) a partir de texto plano.
- Conversión de texto a fonemas espeak-ng en alfabeto IPA como paso previo a la síntesis.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python a través de `phoonnx.model_manager.TTSModelManager`.
- Soporte en navegador mediante `phoonnx.js` (voz VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz open source con OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente doméstico en alemán responda con una voz concreta (GLaDOS) configurada en `mycroft.conf`.
- Síntesis de voz en aplicaciones de escritorio en Python: mediante `TTSModelManager` y `voice.synthesize_wav` se puede generar audio WAV a partir de frases en alemán y reproducirlo en una aplicación local.
- Prototipado de interfaces conversacionales en alemán: al ser un modelo pequeño (repo de 0,1 GB) y con licencia MIT, es adecuado para pruebas rápidas de UX de voz sin depender de servicios en la nube.
- Síntesis en el navegador: con `phoonnx.js` se puede ejecutar la voz en cliente para demos o aplicaciones web que necesiten TTS en alemán sin backend.
- Generación de audio para contenido creativo o de fans: la voz GLaDOS permite crear clips de audio con fines de entretenimiento o proyectos derivados de Portal, respetando la licencia MIT del empaquetado.
- Integración en pipelines de accesibilidad: lectura en voz alta de texto en alemán en aplicaciones de lectura o interfaces para personas con discapacidad visual, con inferencia local y sin coste por petición.
- Pruebas de regresión en sistemas TTS: al ser un modelo determinista y ligero, sirve para validar pipelines de fonemización espeak-ng y de síntesis en entornos CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,1 GB) se espera un consumo de memoria muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS "low", puede ejecutarse en CPU sin GPU dedicada. Cualquier GPU consumer (por ejemplo, GTX 1060 o superior) sería más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: `phoonnx` (Python y OVOS), `phoonnx.js` (navegador), ONNX Runtime; requiere `espeak-ng` instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-glados-low` | VITS | de-DE | MIT | ONNX | Voz GLaDOS, variante low, empaquetado para phoonnx |
| `systemofapwne/piper-de-glados` (upstream) | VITS (Piper) | de-DE | no disponible | no disponible | Origen del modelo; misma voz GLaDOS |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT (según model card) | ONNX | Mismo pipeline de empaquetado y ejecución |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente en alemán (`de-DE`); no soporta otros idiomas.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Variante "low": la calidad de audio es inferior a la de variantes de mayor tamaño del mismo proyecto.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento.
- La voz imita a un personaje de ficción (GLaDOS); su uso comercial puede estar sujeto a consideraciones de propiedad intelectual ajenas a la licencia MIT del empaquetado.
- La licencia MIT del empaquetado remite a los términos del release upstream; conviene verificar las condiciones del proyecto original antes de un uso comercial.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su composición.
- Requiere instalar `espeak-ng` o el extra `phoonnx[espeak]`; sin ello la inferencia no funciona correctamente.
- No apto para tareas de razonamiento, generación de texto, código o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-low
- Modelo upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
