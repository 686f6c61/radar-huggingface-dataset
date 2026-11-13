# 2008-horse/horse-nikud

## Resumen

Horse Nikud 1.1 es un modelo especializado en la diacritización del hebreo, es decir, en añadir los puntos vocálicos (niqqud) a textos hebreos escritos sin ellos. Lo desarrolla el autor independiente 2008-horse y se distribuye como un modelo ONNX de tipo int8 de apenas 5,4 MB, pensado para ejecutarse de forma totalmente local y sin servidor. Resuelve un problema muy concreto del procesamiento del lenguaje natural en hebreo: la mayoría de textos modernos omiten el niqqud, lo que dificulta tareas de síntesis de voz, enseñanza del idioma o transliteración.

A diferencia de los grandes modelos generativos, no es un transformer de propósito general con parámetros publicados, sino un modelo compacto de inferencia cerrada empaquetado en ONNX, con un vocabulario de 5.910 bytes y artefactos auxiliares. Su relevancia radica en su despliegue ligero (cabe en cualquier entorno, incluido JavaScript mediante `onnxruntime-web`) y en un enfoque de distribución con verificación criptográfica de los artefactos mediante SHA-256 y firma minisign.

La información pública disponible es escasa: no se detallan la arquitectura interna, el número de parámetros ni los datos de entrenamiento, y el propio autor advierte que no publica cifras de precisión. La licencia es la Horse Models Community License v2.0, gratuita solo para uso no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX; arquitectura interna no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo ONNX cuantizado en int8) |
| Idiomas soportados | hebreo (he) |
| Licencia | Horse Models Community License v2.0 (uso comercial requiere licencia) |
| Formato de pesos | ONNX (`model.onnx`), mas `vocab.json` y `artifact.json` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Se distribuye exclusivamente como un grafo ONNX cuantizado en int8 (`model.onnx` de 5.410.365 bytes), acompañado de un vocabulario (`vocab.json`, 5.910 bytes) y un fichero de artefacto (`artifact.json`, 4.972 bytes). El tamaño total del repositorio es de 0,0 GB, lo que confirma que se trata de un modelo de muy pequeña huella.

Tampoco se detallan el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO. La model card solo indica que el modelo se entrenó en parte con material de terceros que conserva sus propias licencias, cuyas atribuciones figuran en `THIRD-PARTY-NOTICES.md`. Como innovación destacable en la distribución, el repositorio incluye un manifiesto `SHA256SUMS` firmado con minisign y una clave pública para verificar la integridad de los seis ficheros de carga útil.

## Capacidades

- Diacritización del hebreo: añade niqqud (puntos vocálicos) a texto hebreo escrito sin ellos.
- Ejecución totalmente offline, sin servidor, mediante un modelo ONNX int8 y sus ficheros de datos.
- Integración en JavaScript: SDK disponible vía `npm install @2008-horse/horse-nikud onnxruntime-web`, con `create({ ort, model, vocab })`.
- Verificación de integridad de los artefactos mediante SHA-256 y firma minisign.
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Síntesis de voz en hebreo: el niqqud es necesario para una pronunciación correcta; el modelo permite diacritizar el texto antes de pasarlo a un motor TTS, con la ventaja de ejecutarse localmente y sin latencia de red.
- Enseñanza del hebreo: generar textos vocalizados para materiales didácticos y ejercicios de lectura, aprovechando que el modelo es gratuito para uso no comercial.
- Procesamiento de textos litúrgicos y bíblicos: completar la vocalización de pasajes que se transmiten sin puntos vocálicos, en un flujo offline verificable.
- Aplicaciones web del lado del cliente: al integrarse con `onnxruntime-web`, permite diacritizar texto en el navegador sin enviar datos a un servidor, lo que resulta útil por privacidad.
- Preprocesamiento en pipelines de PLN en hebreo: servir como paso previo de vocalización para tareas posteriores de transliteración o análisis morfológico.
- Herramientas de escritorio y móviles sin conectividad: al pesar unos 5,4 MB, el modelo puede empaquetarse en aplicaciones locales con requisitos mínimos de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no publica ninguna cifra de precisión para este modelo y que la salida puede variar ligeramente entre runtimes y versiones de onnxruntime.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo ONNX int8 ocupa unos 5,4 MB, por lo que cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada y la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en cualquier GPU consumer; también en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (incluido `onnxruntime-web` para JavaScript); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de diacritización del hebreo ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se publica ninguna cifra de precisión; el niqqud generado son predicciones del modelo y puede contener errores.
- La salida puede diferir ligeramente entre runtimes y versiones de onnxruntime, lo que afecta a la reproducibilidad exacta.
- Especializado exclusivamente en hebreo; no soporta otros idiomas.
- Licencia restrictiva: gratuita solo para uso no comercial; el uso comercial requiere licencia a través de https://2008-horse.com/licensing/.
- El modelo incorpora material de terceros con sus propias licencias, cuyas atribuciones deben respetarse según `THIRD-PARTY-NOTICES.md`.
- No se documentan sesgos conocidos, pero al no publicarse detalles del corpus de entrenamiento no es posible evaluarlos.
- No es un modelo generativo de propósito general: no debe emplearse para tareas distintas de la diacritización.
- La verificación de integridad depende de la clave pública de firma; conviene validar `SHA256SUMS` antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2008-horse/horse-nikud
- Sitio web oficial: https://2008-horse.com
- Licencia comercial: https://2008-horse.com/licensing/
- Clave pública de firma: https://2008-horse.com/security/model-signing-key.txt
