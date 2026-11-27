# pinaltech/sift-categories

## Resumen

Sift Categories es un modelo de clasificación de correo electrónico desarrollado por pinaltech para Picacho, un cliente de correo. Su función es asignar cada mensaje de la bandeja de entrada a una de nueve categorías: Primary, Transactions, Travel, Finance, Updates, Newsletters, Promotions, Social y Forums. No es un modelo generativo ni un transformer de gran escala: es un clasificador ligero que se ejecuta localmente en el dispositivo del usuario y que complementa un sistema de reglas deterministas, interviniendo solo en los casos en los que dichas reglas no alcanzan un nivel de certeza suficiente.

El modelo se distribuye como un único fichero binario (`categories-v1.bin`) de aproximadamente 1,2 MB, con pesos almacenados en enteros de 8 bits y una escala por fila (formato propio `PICAWHN1`). La arquitectura es una red neuronal muy pequeña: las características de entrada se suman en 32 unidades ocultas y se aplica una softmax sobre las nueve categorías. La entrada combina palabras del asunto, la vista previa (primeros 400 caracteres), el nombre y la dirección del remitente, las cabeceras de lista y un conjunto de 48 conceptos léxicos con unas 2.100 raíces en múltiples idiomas, todo ello hasheado en 32.768 posiciones.

La relevancia de este modelo radica en su enfoque de privacidad y eficiencia: la clasificación se realiza en el propio equipo, sin enviar correo a servidores externos, y el modelo es lo bastante pequeño como para descargarse bajo demanda y ejecutarse en un runtime nativo. Está publicado con licencia MIT y declara soporte para 38 idiomas, aunque las plantillas de datos fueron escritas por el autor y no han sido revisadas por hablantes nativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con embedding hasheado, 32 unidades ocultas y softmax sobre 9 clases |
| Parámetros totales | No disponible (embedding de 32.768 × 32 almacenado en int8; tamaño del fichero ~1,2 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa asunto, primeros 400 caracteres de la vista previa y metadatos del remitente y cabeceras) |
| Tipos de cuantización | Pesos almacenados en enteros de 8 bits con escala por fila (formato `PICAWHN1`); no se documentan otras cuantizaciones |
| Idiomas soportados | 38 códigos: inglés, español, alemán, francés, portugués, italiano, neerlandés, sueco, danés, noruego, catalán, polaco, ruso, ucraniano, checo, eslovaco, croata, búlgaro, rumano, húngaro, finés, griego, turco, árabe, persa, hebreo, hindi, bengalí, indonesio, malayo, vietnamita, tailandés, japonés, chino simplificado y tradicional, coreano, tagalo y suajili |
| Licencia | MIT |
| Formato de pesos | Binario propio (`categories-v1.bin`), formato `PICAWHN1` |

## Arquitectura y entrenamiento

El modelo no es un transformer. Se trata de un clasificador lineal con una capa oculta de 32 unidades: las características de entrada, hasheadas en 32.768 posiciones, se suman en esas 32 unidades y se aplica una softmax sobre las nueve categorías. Las características incluyen palabras y pares de palabras del asunto, palabras de la vista previa (primeros 400 caracteres), el nombre del remitente, las partes de la dirección (por ejemplo, `ship-confirm` se descompone en *ship* y *confirm*), el dominio y subdominios, el dominio de nivel superior, los conceptos léxicos detectados (48 conceptos con unas 2.100 raíces en varios idiomas, como *sale*, *discount*, *order*, *receipt*, *ship*, *security*, *statement*, *follow*, *comment*, *group*, *topic*, *flight*, *hotel*, *bank*, *transfer* o *issue*), las cabeceras de lista (List-Unsubscribe, List-Id y sus partes, List-Post) y señales como porcentajes o precios junto a dígitos, emojis de compra, prefijos de asunto de respuesta o de lista (`Re:`, `[group]`), palabras en mayúsculas, nombres con aspecto de persona y nombres que coinciden con el dominio.

Los datos de entrenamiento son completamente sintéticos: el script `data.py` genera el correo y nada en él es real. La categoría Primary se compone de mensajes del modelo de respuestas en sus 38 idiomas, procedentes de direcciones de personas en proveedores de correo, lugares de trabajo y universidades, con algunos casos de direcciones de rol de pequeñas empresas y algunos reenvíos. Las categorías Transactions, Travel, Finance, Updates, Newsletters, Promotions y Social se construyen a partir de plantillas para 37 tipos de correo (un pedido, un envío, una entrega, un recibo, un reembolso; una reserva, el check-in de un vuelo, una tarjeta de embarque o un retraso; un extracto, una factura, una alerta de tarjeta o transferencia, un documento de saldo o impuestos, dinero recibido; una alerta de seguridad, un recordatorio, una renovación, una notificación, una bienvenida, un cambio de política; un boletín, un número de este; una rebaja, un código de descuento, novedades, envío gratuito, puntos de fidelidad, un evento, un "te echamos de menos"; un comentario, un seguidor, un mensaje, una solicitud de amistad, una mención, recuerdos, un me gusta) en todos los idiomas indicados.

Una innovación destacable es el aprendizaje local por remitente: cuando el usuario mueve un remitente a otra categoría, las hasta 12 últimas comunicaciones de ese remitente ajustan una pequeña capa lineal sobre las mismas características, sumada a las puntuaciones del modelo. Los pesos originales del modelo no cambian; lo aprendido se guarda como preferencia en el equipo (máximo 6.000 características) y persiste entre activaciones del modo, pudiéndose olvidar desde los ajustes. Además, el modelo solo prevalece sobre las reglas cuando su confianza supera umbrales concretos: 70 % entre categorías distintas, 80 % para mover correo a Primary y 90 % para sacarlo de Primary, de modo que el correo de personas tiende a permanecer ahí.

## Capacidades

- Clasificación de correo en nueve categorías: Primary, Transactions, Travel, Finance, Updates, Newsletters, Promotions, Social y Forums.
- Procesamiento de múltiples señales del mensaje: nombre y dirección del remitente, asunto, vista previa (primeros 400 caracteres) y cabeceras de lista.
- Detección de conceptos léxicos multilingües mediante 48 conceptos y unas 2.100 raíces, con búsqueda de palabras completas, raíces y coincidencias en escrituras sin espacios (árabe, persa, hebreo, tailandés, japonés, chino, coreano).
- Soporte de 38 idiomas, incluyendo escrituras latinas, cirílicas, árabes, hebreas, índicas, del sudeste asiático y del este de Asia.
- Integración con un sistema de reglas deterministas: el modelo solo interviene cuando las reglas no son concluyentes, con umbrales de confianza asimétricos.
- Aprendizaje local por remitente: ajuste de una capa lineal sobre las características existentes a partir de movimientos manuales del usuario, sin modificar los pesos del modelo.
- Ejecución local en el dispositivo mediante el runtime nativo `NativeTagger`, sin envío de datos a servidores externos.
- Verificación de integridad en la descarga: comprobación de tamaño y SHA-256 del fichero del modelo.
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Clasificación automática de la bandeja de entrada en un cliente de correo: el modelo puntúa cada mensaje en las nueve categorías y, cuando su confianza supera los umbrales definidos, asigna la categoría; es adecuado porque funciona en local y con un coste computacional mínimo.
- Desambiguación de correos que las reglas no resuelven: los pasos deterministas (remitentes ya clasificados, correo propio, recibos, códigos de acceso, clasificación nativa de Gmail y Outlook) se aplican primero; el modelo actúa como segunda opinión en los casos dudosos.
- Filtrado de correo transaccional en entornos con múltiples idiomas: al cubrir 38 idiomas y detectar conceptos como *order*, *receipt*, *ship* o *statement*, puede separar pedidos, envíos y recibos en bandejas multilingües.
- Protección del correo personal: los umbrales de 80 % para entrar en Primary y 90 % para salir de ella reducen el riesgo de que el correo de personas se desplace a otras categorías.
- Personalización por remitente sin reentrenamiento: cuando el usuario mueve un remitente a otra categoría, el ajuste local de la capa lineal hace que mensajes similares de otros remitentes se clasifiquen de forma parecida, útil en flujos de trabajo con remitentes recurrentes.
- Despliegue en dispositivos con recursos limitados: con un fichero de aproximadamente 1,2 MB y pesos en int8, puede ejecutarse en equipos de escritorio y portátiles sin GPU dedicada.
- Integración en pipelines de organización de correo empresarial con requisitos de privacidad: al no enviar datos a la nube, encaja en entornos donde el correo no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU y se ejecuta en CPU mediante el runtime nativo `NativeTagger`.
- GPU recomendadas: no aplica; no se documenta uso de GPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo está diseñado para ejecutarse en el dispositivo sin aceleración gráfica.
- Opciones de despliegue: runtime propio de Picacho (`NativeTagger` en `src/manage/local_ai/runtime.rs`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el tamaño del modelo (aproximadamente 1,2 MB) y su arquitectura de 32 unidades ocultas sugieren una inferencia muy rápida, pero no se proporcionan cifras.
- Almacenamiento: el fichero `categories-v1.bin` ocupa aproximadamente 1,2 MB; el repositorio de Hugging Face figura con 0,0 GB.
- Requisito de red: descarga única desde Hugging Face al activar la función, con verificación de tamaño y SHA-256.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de correo con características equivalentes (ejecución local, tamaño de aproximadamente 1,2 MB, licencia MIT y soporte de 38 idiomas).

## Limitaciones y advertencias

- Los datos de entrenamiento son completamente sintéticos y generados por plantillas; el rendimiento sobre correo real no está validado en la información disponible.
- Las plantillas y los textos multilingües fueron escritos por el autor y no han sido revisados por hablantes nativos, lo que puede introducir sesgos o errores en idiomas distintos del inglés.
- El modelo solo cubre nueve categorías fijas; no clasifica en categorías personalizadas más allá del aprendizaje local por remitente.
- Los umbrales de confianza (70 %, 80 % y 90 %) son heurísticas definidas por el autor; no se documenta su calibración empírica.
- El aprendizaje local está limitado a un máximo de 6.000 características y a las hasta 12 últimas comunicaciones por remitente; no modifica los pesos del modelo.
- No se documentan evaluaciones de sesgo, robustez frente a adversarios ni tasas de alucinación o error; al ser un clasificador, el riesgo principal es la clasificación errónea, no la generación de contenido.
- La licencia MIT permite uso comercial, pero no se especifican garantías ni condiciones adicionales más allá de las estándar de dicha licencia.
- El modelo depende de un runtime propietario de Picacho (`NativeTagger`); no se documentan exportaciones a formatos estándar como GGUF, ONNX o safetensors, lo que limita su reutilización fuera de esa aplicación.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-27, lo que sugiere que la información puede ser incompleta o preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinaltech/sift-categories
- Repositorio de Picacho (referenciado en la model card, sin URL directa disponible): no disponible
- Documentación del runtime `NativeTagger` (referenciada en la model card, sin URL directa disponible): no disponible
- Paper o blog técnico: no disponible
- Demo: no disponible
